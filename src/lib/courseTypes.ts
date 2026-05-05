/**
 * courseTypes.ts — Canonical Section / Lesson types used by both
 * the admin panel (CoursesManager) and the CoursePlayer.
 *
 * These replace the old types from mockData.ts.
 */

export interface Lesson {
  id: string;
  title: string;
  sectionId: string;
  courseId: string;
  type: 'video' | 'text' | 'quiz';
  videoUrl?: string;
  description?: string;
  duration: string;
  orden: number;
}

export interface Section {
  id: string;
  title: string;
  courseId: string;
  orden: number;
  lessons: Lesson[];
}

export interface FAQ {
  id: string;          // Notion page id or temp uuid
  q: string;
  a: string;
  orden: number;
}

export interface HomeConfig {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    btn1: string;
    btn2: string;
  };
  logoUrl: string;
  features: {
    icon: string;
    title: string;
    description: string;
    color: string;
  }[];
}
