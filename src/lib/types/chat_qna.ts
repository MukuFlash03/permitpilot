// export type JobsResponse = {
//   job_id: number,
//   recruiter_id: string,
//   job_title: string,
//   company_name: string,
//   companyURL: string,
//   job_description: string,
//   required_skills: string,
//   custom_questions: string[],
//   analysis_status: boolean,
//   characteristicValues: string,
// };

// export type SelectedJobsResponse = Pick<JobsResponse,
//   'job_id' | 'job_title' | 'company_name' | 'analysis_status'
// >;

export interface ChatQnAData {
  question: string;
  answer: string;
}

export interface ChatAnswers {
  answers: string;
}

export interface ChatQnADataList {
  qnaList: ChatQnAData[]
}

export interface ChatMessage {
  type: 'user' | 'ai';
  message: string;
}
