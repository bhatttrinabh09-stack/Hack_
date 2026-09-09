export type RootStackParamList = {
  Auth: undefined;
  BranchSelect: undefined;
  Home: undefined; // Semesters
  Subject: { semesterId: number; branch?: string };
  TopicList: { subjectId: string; subjectName?: string };
  Swipe: { topicId: string; topicTitle?: string; subjectId?: string };
  Content: { topicId: string; topicTitle?: string };
};

