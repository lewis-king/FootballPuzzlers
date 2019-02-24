import email from 'react-native-email';

const handleEmail = () => {
  const to = ['lking1221@gmail.com'];
  email(to, {
    subject: 'Football - Who am I? - Feedback',
    body: ''
  }).catch(console.error)
};

export default handleEmail;