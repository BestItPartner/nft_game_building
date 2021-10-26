import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';


function MessageBox(props) {
    const { title, message, onClose } = props;
    return (
      <div>      
        <Dialog
          open={true}
          onClose={onClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">   
            {message}         
            </DialogContentText>
          </DialogContent>
          <DialogActions>          
            <Button onClick={onClose} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
}

MessageBox.propTypes = {
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

MessageBox.defaultProps = {
    title: '',
    message: ''
};

export default MessageBox;