import React from 'react';
import styled from 'styled-components';

import Toast from 'react-bootstrap/Toast';

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentDidUpdate = () => {
    if (this.props.text !== '' && !this.state.show) {
      this.setState({ show: true });
    }
  }

  dismiss = () => {
    this.props.onDismiss();
    this.setState({ show: false });
  }

  render() {
    return (
      <StyledToast className="rounded-lg" show={this.state.show} onClose={this.dismiss} autohide>
        <Toast.Header>
          <strong className="mr-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body>
          {this.props.text}
        </Toast.Body>
      </StyledToast>
    );
  }
}

const StyledToast = styled(Toast)`
  position: absolute;
  top: 3em;
  right: 3em;
`;

export default Notification;