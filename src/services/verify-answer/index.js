export default function verifyAnswer(givenAnswer, qAndA) {
    console.log("acceptableAnswers: " + qAndA.acceptableAnswers)
    const filtered = qAndA.acceptableAnswers.filter((e) => {
        return e.toUpperCase() === givenAnswer.toUpperCase();
    });
    console.log("filtered array: " + filtered);
    return filtered.length > 0;
};
