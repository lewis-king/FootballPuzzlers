export default function verifyAnswer(givenAnswer, qAndA) {
    const acceptedAnswersArr = qAndA.acceptableAnswers.split(",");
    console.log("acceptableAnswers: " + acceptedAnswersArr);
    const filtered = acceptedAnswersArr.filter((e) => {
        return e.toUpperCase() === givenAnswer.toUpperCase().trim();
    });
    console.log("filtered array: " + filtered);
    return filtered.length > 0;
};
