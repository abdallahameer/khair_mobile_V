export interface Video {
  id: number | string;
  video?: string;
  video_url: string;
  username: string;
  user_id: string;
  uploaded_at: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  saves_count: number;
  is_liked: number; // 0 or 1
  is_saved: number; // 0 or 1
  profile_image?: string | null;
}

export interface UserProfileType {
  user: {
    id: string;
    username: string;
    created_at: string;
    profile_image: string | null;
  };
  videos: {
    id: string;
    video_url: string;
    uploaded_at: string;
    likes_count: number;
    comments_count: number;
    views_count: number;
    saves_count: number;
    is_liked: number;
    is_saved: number;
  }[];
}

export interface VideoItem {
  id: string;
  video_url: string;
  uploaded_at: string;
  username?: string;
  user_id?: string;
}

export interface User {
  id: string;
  username: string;
  profile_image?: string | null;
}

export interface Comment {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  username: string;
  profile_image: string | null;
}

export interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

export interface SidebarProps {
  currentUser: User | null;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export interface SingleVideoComponentProps {
  videoId: string;
  onClose: () => void;
  userId: string;
}

export interface PendingVideo {
  id: number | string;
  video: string;
  uploadedAt: string;
}

export interface UseRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onProgress?: (progress: number) => void;
  headers?: Record<string, string>;
}

export interface LoginFormInputs {
  userName: string;
  password: string;
}
