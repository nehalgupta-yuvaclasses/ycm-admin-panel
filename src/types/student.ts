export interface StudentLecture {
  id: string;
  title: string;
  type: "recorded" | "live";
  video_id?: string;
  video_url?: string;
  live_url?: string;
  scheduled_at?: string;
  duration: string;
  thumbnail?: string;
}

export interface StudentSubject {
  id: string;
  name: string;
  lectureCount: number;
  icon?: string;
}

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  progress?: number;
}
