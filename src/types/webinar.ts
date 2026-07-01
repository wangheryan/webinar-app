// src/types/webinar.ts

export type AccessType = "FREE" | "PAID";
export type PaymentStatus = "PENDING" | "SETTLED" | "EXPIRED" | "FAILED";

export interface FAQItem {
  q: string;
  a: string;
}

export interface SpeakerData {
  id: string;
  name: string;
  title: string;
  company: string | null;
  image: string;
  bio: string | null;
  credentials: string[];
  linkedinUrl: string | null;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebinarSessionData {
  id: string;
  webinarId: string;
  title: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebinarAddonData {
  id: string;
  webinarId: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebinarData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  category: string;
  basePrice: number;
  accessType: AccessType;
  imageUrl: string;
  abstract: string;
  isLive: boolean;
  faqs: FAQItem[];
  createdAt: Date;
  updatedAt: Date;
  speakers: SpeakerData[];
  sessions: WebinarSessionData[];
  addons: WebinarAddonData[];
  enrollmentCount: number;
}