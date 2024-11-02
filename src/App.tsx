import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Calendar } from 'lucide-react';
import { Button } from './components/ui/button';
import { toast } from './hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from './components/ui/dialog';
import { Label } from './components/ui/label';

interface Video {
  VideoID: string;
  Title: string;
  Description: string;
  PublishedAt: string;
  ThumbnailURL: string;
  ChannelTitle: string;
  ChannelID: string;
}

interface ApiResponse {
  error: boolean;
  response: {
    videos: Video[];
  };
}

const App = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [publishedAfter, setPublishedAfter] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [addingKey, setAddingKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const observer = useRef<IntersectionObserver>();
  const PAGINATION_SIZE = 10;

  const addApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingKey(true);
      const response = await fetch('http://13.202.201.248:3000/videos/key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey.trim()
        }),
      });

      const data = await response.json();
      
      if (data.error === false && data.response.success) {
        toast({
          title: "Success",
          description: "API key added successfully",
        });
        setDialogOpen(false);
        setApiKey(''); // Clear the input
      } else {
        toast({
          title: "Error",
          description: "Failed to add API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive",
      });
    } finally {
      setAddingKey(false);
    }
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('.')[0] + 'Z';
  };

  const fetchVideos = async (pageNum: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort_order: sortOrder,
        pagination_size: PAGINATION_SIZE.toString(),
        pagination_page: pageNum.toString(),
      });
      
      if (publishedAfter) {
        const formattedDate = formatDateForAPI(publishedAfter);
        params.append('published_after', formattedDate);
      }

      console.log('Fetching videos with params:', params.toString()); 

      const response = await fetch(`http://13.202.201.248:3000/videos?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();
      
      if (data.error === false) {
        if (pageNum === 1) {
          setVideos(data.response.videos);
        } else {
          setVideos(prev => [...prev, ...data.response.videos]);
        }
        setHasMore(data.response.videos.length === PAGINATION_SIZE);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastVideoRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    console.log('Filter changed - Sort:', sortOrder, 'Date:', publishedAfter);
    setVideos([]);
    setPage(1);
    setHasMore(true);
    fetchVideos(1);
  }, [sortOrder, publishedAfter]);

  useEffect(() => {
    if (page > 1) {
      fetchVideos(page);
    }
  }, [page]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    console.log('Date changed to:', newDate);
    setPublishedAfter(newDate);
  };

  const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* API Key Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add API Key</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add YouTube API Key</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your YouTube API key..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={addApiKey} 
              disabled={addingKey}
            >
              {addingKey ? 'Adding...' : 'Add Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500" size={20} />
            <Input
              type="datetime-local"
              value={publishedAfter}
              onChange={handleDateChange}
              className="flex-1"
              placeholder="Filter by date..."
            />
          </div>
        </div>
        <Select
          value={sortOrder}
          onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Videos Grid */}
      <div className="grid gap-4">
        {videos.map((video, index) => (
          <div
            key={`${video.VideoID}-${index}`}
            ref={index === videos.length - 1 ? lastVideoRef : undefined}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={video.ThumbnailURL}
                    alt={video.Title}
                    className="w-40 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{video.Title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{video.ChannelTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDisplayDate(video.PublishedAt)}
                    </p>
                    {video.Description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {video.Description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      )}

      {/* No More Videos */}
      {!hasMore && videos.length > 0 && (
        <p className="text-center text-gray-500 py-4">No more videos to load</p>
      )}

      {/* No Videos Found */}
      {!loading && videos.length === 0 && (
        <p className="text-center text-gray-500 py-4">No videos found</p>
      )}
    </div>
  );
};

export default App;