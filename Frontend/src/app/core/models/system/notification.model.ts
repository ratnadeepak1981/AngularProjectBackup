export interface Notification {
  id: number;
  studentId: number;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}
