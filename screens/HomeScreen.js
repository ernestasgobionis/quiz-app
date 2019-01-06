import React from 'react';
import glamorous from 'glamorous-native';
import { ActivityIndicator } from 'react-native';
import _ from 'lodash';
import QuestionsList from '../components/QuestionsList';

const Container = glamorous.view({
  flex: 1,
  paddingTop: 60,
  paddingBottom: 40,
  alignItems: 'center',
  justifyContent: 'center',
});

const GenericButton = glamorous.touchableOpacity({
  paddingVertical: 10,
  paddingHorizontal: 30,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#acacac',
  borderRadius: 4,
});

const FinishedContainer = glamorous.view({});

const ScoreLabel = glamorous.text({
  paddingBottom: 20,
});

const ButtonText = glamorous.text({});

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      questions: {
        items: null,
        loading: false,
      },
      fetchError: null,
      started: false,
      finished: false,
      startTime: null,
      score: null,
      duration: null,
    };
  }

  fetchQuestions = async () => {
    this.setState({
      questions: {
        items: null,
        loading: true,
      },
      finished: false,
      score: null,
      duration: null
    });
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=10');
      const questions = await response.json();
      questions.results.forEach((q, id) => {
        let questionString = _.unescape(q.question);
        if (q.type === 'multiple') {
          let answers = [{ label: _.unescape(q.correct_answer), value: q.correct_answer }];
          q.incorrect_answers.forEach(ans => answers.push({ label: _.unescape(ans), value: ans }));
          q.answers = answers;
        }
        questionString = questionString.replace(/&#039;/g, '\'');
        q.question = questionString;
        q.id = id;
      });
      this.setState({
        questions: {
          items: questions.results,
          loading: false,
        },
        started: true,
        startTime: new Date(),
      });
    } catch (e) {
      this.setState({
        questions: {
          items: null,
          loading: false,
        },
        fetchError: e,
      });
    }
  };

  onFinishQuiz = async (answers) => {
    const { questions, startTime } = this.state;
    let correctAnswers = 0;
    Object.keys(answers).forEach((ansKey) => {
      const question = questions.items.find(q => {
        return q.id.toString() === ansKey.toString();
      });
      if (answers[ansKey].toString().toLowerCase() === question.correct_answer.toLowerCase()) {
        correctAnswers += 1;
      }
    });
    const duration = ((new Date().getTime() - startTime.getTime()) / 1000).toFixed(1);
    this.setState({ finished: true, started: false, startTime: null, duration: duration, score: correctAnswers });
  };

  renderContent = (questions, finished, started, duration, score) => {
    const listProps = {
      questions,
      onSubmit: this.onFinishQuiz,
    };
    if (questions.loading) {
      return (
        <ActivityIndicator size="large" color="#2aaaff" />
      );
    }
    if (finished) {
      return (
        <FinishedContainer>
          <ScoreLabel>
            Your scored {`${score}/${questions.items.length} in ${duration} seconds`}
          </ScoreLabel>
          <GenericButton onPress={this.fetchQuestions}>
            <ButtonText>
              Play Again
            </ButtonText>
          </GenericButton>
        </FinishedContainer>
      );
    }
    if (questions.items) {
      return <QuestionsList {...listProps} />;
    } else {
      return (
        <GenericButton onPress={this.fetchQuestions}>
          <ButtonText>
            Start Quiz
          </ButtonText>
        </GenericButton>
      );
    }
  };

  render() {
    const { questions, finished, started, duration, score } = this.state;
    return (
      <Container>
        {this.renderContent(questions, finished, started, duration, score)}
      </Container>
    );
  }
}
