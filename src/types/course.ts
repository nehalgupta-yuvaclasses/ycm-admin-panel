export type LectureType = "recorded" | "live" | "document";

export interface Lecture {
  id: string;
  title: string;
  type: LectureType;
  duration?: string; // for recorded/document
  pages?: number; // for document
  videoId?: string; // Cloudflare video ID
  videoUrl?: string;
  liveUrl?: string;
  scheduledAt?: string; // ISO date string for live classes
}

export interface Module {
  id: string;
  title: string;
  lessons: Lecture[];
}
