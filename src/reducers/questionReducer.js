import {SET_CURRENT_QUESTION} from '../actions/question'
import {SET_QUESTIONS} from '../actions/question'

const questionReducer = (state = {}, action) => {
  switch(action.type) {
    case SET_CURRENT_QUESTION:
      return {
        questions: action.questions
      }
    case SET_QUESTIONS:
      return {
        question: action.question
      }
    default:
      return state;
  }
};

export default questionReducer