export const SET_QUESTIONS = "SET_QUESTIONS";
export const SET_CURRENT_QUESTION = "SET_CURRENT_QUESTION";

export function setQuestions(questions) {
  return {
    type: SET_QUESTIONS,
    questions
  }
}

export function setCurrentQuestion(question) {
  return {
    type: SET_CURRENT_QUESTION,
    question
  }
}

