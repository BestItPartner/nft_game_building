import React, { useState } from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CloseIcon from '@material-ui/icons/Close';
import { Container, Grid, Paper, Typography, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText, IconButton, Zoom, TextField, Button, CircularProgress } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import imgAPI from '~/public/images/imgAPI';
import { withTranslation } from '~/i18n';
import yt from '~/youtube';
import { useText } from '~/theme/common';
import Title from '../Title';
import useStyles from './feature-style';
import { presaleBuy } from "../../libs/presale";
import { nftItems } from "../../libs/const";
import MessageBox from '../Notification/MessageBox';

const Transition = React.forwardRef(function Transition(props, ref) { // eslint-disable-line
  return <Zoom ref={ref} {...props} />;
});

const TransitionSlide = React.forwardRef(function Transition(props, ref) { // eslint-disable-line
  return <Slide direction="up" ref={ref} {...props} />;
});

function MainFeature(props) {
  const classes = useStyles();
  const text = useText();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = props;
  const [player, setPlayer] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [itemCounts, setItemCounts] = useState(0);
  const [itemPrice, setItemPrice] = useState(0);
  const [msgBox, showMsgBox] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);
  
  const handleAgreeToBuy = async () => {
    setOpenConfirm(false);

    if (itemCounts > 0 && itemPrice > 0) {
      setIsLoading(true);
      const message = await presaleBuy(itemsList, itemPrice);
      setIsLoading(false);
      showMessageBox("Alert", message);

      setItemsList([]);
      setItemCounts(0);      
    }
    else {
      showMessageBox("Alert", "Please set items' count.");
    }
  }

  const handleDisagreeToBuy = async () => {
    setOpenConfirm(false);
  }

  function showMessageBox(title, message)
  {
    setMsgTitle(title);
    setMsgContent(message);
    showMsgBox(true);
  }

  function handleCloseMessageBox()
  {
    showMsgBox(false);
    setMsgTitle("");
    setMsgContent("");
  }

  const handleChangeCount = (event) => {
    try {
      const _id = parseInt(event.target.id);
      const _count = event.target.value.length == 0 ? 0 : parseInt(event.target.value);
      const _items = itemsList;
      const _item = _items.find(x => x.id === _id);
      if (_item == undefined) {
        if (_count > 0)
          _items.push({'id': _id, 'count': _count});
      }
      else {
        if (_count > 0) {
          _item.count = _count;
        }
        else {
          const index = _items.indexOf(_item);
          _items.splice(index, 1);
        }
      }
      setItemsList(_items);
      setItemCounts(_items.length);
      let totalPrice = 0;
      _items.forEach(currentItem => {
        let _nftitem;
        for (let i = 0; i < 3; i++) {
          _nftitem = nftItems[i].find(x => x.id === currentItem.id);
          if (_nftitem != undefined)
            break;
        }
        if (_nftitem != undefined) {
          const _price = currentItem.count * _nftitem.price;          
          totalPrice += _price;
        }        
      })
      setItemPrice(Number((totalPrice).toFixed(4)));
    } catch (error) {
      console.log(error);      
    }
  };

  const handleBuyItems = async () => {
    setOpenConfirm(true);
  }

  const handleClickOpen = () => {
    if (yt.use) {
      setOpenPopup(true);
      player[0].playVideo();
    }
  };

  const handleClose = () => {
    setOpenPopup(false);
    player[0].pauseVideo();
  };

  const _onReady = event => {
    player.push(event.target);
    setPlayer(player);
  };

  const opts = {
    height: '360',
    width: '640',
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 1,
      mute: 0,
      origin: 'https://localhost:3003'
    }
  };

  return (
    <div className={classes.mainFeature}>
      {msgBox && 
      <MessageBox title={msgTitle} message={msgContent} onClose={handleCloseMessageBox}/>
      }   
      <Dialog
        open={openConfirm}
        TransitionComponent={TransitionSlide}
        keepMounted
        onClose={handleDisagreeToBuy}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Do you agree to buy the selected nft items?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisagreeToBuy}>Disagree</Button>
          <Button onClick={handleAgreeToBuy}>Agree</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPopup}
        TransitionComponent={Transition}
        keepMounted
        classes={{ paper: classes.videoPopup }}
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {t('common:crypto-landing.mainfeature_title')}
          <IconButton onClick={handleClose} className={classes.closeBtn}>
            <CloseIcon className={classes.icon} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {yt.use && (
            <YouTube
              videoId="QPMkYyM2Gzg"
              onReady={_onReady}
              opts={opts}
            />
          )}
        </DialogContent>
      </Dialog>
      <Container fixed>
        <Title text={t('common:crypto-landing.mainfeature_title')} align={isMobile ? 'center' : 'left'} />
        <Typography display="block" gutterBottom align={isMobile ? 'center' : 'left'} className={text.subtitle2}>
          {t('common:crypto-landing.mainfeature_subtitle')}
        </Typography>        
        <div className={classes.counter}>
          <div className={classes.higher}>
            <Paper className={classes.paper}>
              <Typography variant="h6">
                Blueprints
              </Typography>
              <Grid container spacing={1}>
                {nftItems[0].map((currentItem, index) => (
                  <React.Fragment key={currentItem.name}>
                    <Grid item md={9} xs={12}>
                      <Typography display="block">
                        {currentItem.title} ({currentItem.price} ETH)
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <TextField
                        id={currentItem.id.toString()}
                        onChange={handleChangeCount}
                        label="Count"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="standard"
                        size="small"
                      />
                    </Grid>
                  </React.Fragment>
                ))} 
              </Grid>                  
            </Paper>
            <Paper className={classes.paper}>
              <Typography variant="h6">
                Tools
              </Typography>
              <Grid container spacing={1}>
                {nftItems[1].map((currentItem, index) => (
                  <React.Fragment key={currentItem.name}>
                    <Grid item md={9} xs={12}>
                      <Typography display="block">
                        {currentItem.title} ({currentItem.price} ETH)
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <TextField
                        id={currentItem.id.toString()}
                        onChange={handleChangeCount}
                        label="Count"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="standard"
                        size="small"
                      />
                    </Grid>
                  </React.Fragment>
                ))} 
              </Grid>                  
            </Paper>
            <Paper className={classes.paper}>
              <Typography variant="h6">
                Materials
              </Typography>
              <Grid container spacing={1}>
                {nftItems[2].map((currentItem, index) => (
                  <React.Fragment key={currentItem.name}>
                    <Grid item md={9} xs={12}>
                      <Typography display="block">
                        {currentItem.title} ({currentItem.price} ETH)
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <TextField
                        id={currentItem.id.toString()}
                        onChange={handleChangeCount}
                        label="Count"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="standard"
                        size="small"
                      />
                    </Grid>
                  </React.Fragment>
                ))} 
              </Grid>                  
            </Paper>   
          </div>
        </div>
        <div className={classes.counter}>
          <div className={classes.higherbuy}>
            <Paper className={classes.paperbuy}>
              <Typography variant="h6">
                Buy NFTs
              </Typography>
              <Grid container spacing={1}>
                <Grid item md={5} xs={12}>
                  <Typography display="block">
                    Total Items: {itemCounts}
                  </Typography>
                </Grid>
                <Grid item md={5} xs={12}>
                  <Typography display="block">
                    Total Price: {itemPrice} ETH
                  </Typography>
                </Grid>                
                <Grid item md={2} xs={12}>
                  <div className={classes.btnArea}>
                    <Button variant="contained" color="secondary" size="large" fullWidth={isMobile} onClick={handleBuyItems} disabled={isLoading}>
                      {isLoading && <CircularProgress size={16}/>}
                      {!isLoading && "Buy"}
                    </Button>                    
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </div>      
        </div>
      </Container>
    </div>
  );
}

MainFeature.propTypes = {
  t: PropTypes.func.isRequired
};

export default withTranslation(['crypto-landing'])(MainFeature);
