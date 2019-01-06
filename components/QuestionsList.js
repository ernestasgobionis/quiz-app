import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous-native';
import { Switch, StyleSheet } from 'react-native';
import RadioForm from 'react-native-simple-radio-button';

const Container = glamorous.view({
  flex: 1,
});
const QuestionsScrollView = glamorous.scrollView({});
const Question = glamorous.view({
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#000',
});
const QuestionText = glamorous.text({
  paddingBottom: 20,
});

const ButtonContainer = glamorous.view({
  paddingVertical: 10,
  flexDirection: 'row',
  justifyContent: 'center',
});

const SubmitButton = glamorous.touchableOpacity({
  paddingVertical: 10,
  paddingHorizontal: 30,
  alignItems: 'center',
  borderRadius: 4,
  backgroundColor: '#2aaaff',
});

const ButtonText = glamorous.text({
  color: '#fff',
});

class QuestionsList extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    questions: PropTypes.object.isRequired,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = this.generateInitialState(props);
  }

  generateInitialState = (props) => {
    const { questions } = props;
    let state = {
      answers: {},
    };
    questions.items.forEach(q => {
      if (q.type === 'boolean') {
        state.answers[q.id] = false;
      }
    });
    return state;
  };

  renderQuestion = (q) => {
    const { answers } = this.state;

    switch (q.type) {
      case 'multiple':
        return (
          <Question key={q.question}>
            <QuestionText>
              {q.question}
            </QuestionText>
            <RadioForm
              radio_props={q.answers}
              initial={-1}
              onPress={(value) => {
                this.setState((prevState) => ({
                  answers: {
                    ...prevState.answers,
                    [q.id]: value,
                  },
                }));
              }}
            />
          </Question>
        );
      case 'boolean':
        return (
          <Question key={q.question}>
            <QuestionText>
              {q.question}
            </QuestionText>
            <Switch
              onValueChange={(value) => {
                this.setState((prevState) => ({
                  answers: {
                    ...prevState.answers,
                    [q.id]: value,
                  },
                }));
              }}
              value={answers[q.id] || 0}
            />
          </Question>
        );
      default:
        break;
    }
  };

  validate = () => {
    return Object.keys(this.state.answers).length === this.props.questions.items.length;
  };

  onSubmit = () => {
    this.props.onSubmit(this.state.answers);
  };

  render() {
    const { questions } = this.props;
    const isFormValid = this.validate();
    return (
      <Container>
        <QuestionsScrollView>
          {questions.items.map((q) => this.renderQuestion(q))}
        </QuestionsScrollView>
        <ButtonContainer style={!isFormValid ? { opacity: 0.5 } : {}}>
          <SubmitButton disabled={!isFormValid} onPress={this.onSubmit}>
            <ButtonText>
              Submit
            </ButtonText>
          </SubmitButton>
        </ButtonContainer>
      </Container>
    );
  }
}

export default QuestionsList;
