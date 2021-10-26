import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import { AccountBalanceWallet, FileCopy } from '@material-ui/icons';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import { ListItem, ListItemIcon, ListItemText, InputLabel, Tooltip, Select, MenuItem, FormControl} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { i18n, withTranslation } from '~/i18n';
import useStyles from './wallet-style';
import imgApi from '~/public/images/imgAPI';
import { useWeb3React } from '@web3-react/core';
import { injected } from './connectors';
import { getNFTtokens } from "../../libs/presale";
import { getItemNameFromId } from "../../libs/const";

const wallet_providers = [
  {    
    icon: imgApi.wallet[0],
    name: 'MetaMask',
    desc: '',
    injected: true,
  },
  // {
  //   icon: imgApi.wallet[1],
  //   name: 'Coinebase Wallet',
  //   desc: '',
  //   injected: false,
  // },
  // {
  //   icon: imgApi.wallet[2],
  //   name: 'WalletConnect',
  //   desc: '',
  //   injected: false,
  // },
];


let themeType = 'light';
if (typeof Storage !== 'undefined') {
  themeType = localStorage.getItem('luxiTheme') || 'light';
}

function Wallet(props) {
  const [ctn, setCtn] = useState(null);
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const {active, account, library, connector, chainId, activate, deactivate } = useWeb3React();
  const [copiedFlag, setCopiedFlag] = useState(false);
  const [tokens, setTokens] = useState([]);

  async function handleClick(event) {
    setAnchorEl(event.currentTarget);    
    const _tokens = await getNFTtokens();
    setTokens(_tokens);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  async function connectToWallet() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnectFromWallet() {
    try {
      deactivate();
    } catch (ex) {
      console.log(ex)
    }
  }

  async function handleChangeWallet(wallet) {
    if (wallet.name === 'MetaMask') {
      if (active) {
        disconnectFromWallet();
      }
      else {
        connectToWallet();                
      }
    }
    else {

    }
    setAnchorEl(null);
  }

  function shortAddress(address) {
    if (address.length > 10) {
      return address.substring(0, 10) + '...  ';
    }
    return '';
  }

  async function copyAddressToClipboard() {
    try {
      if (account != null && 'clipboard' in navigator) {
        await navigator.clipboard.writeText(account);
      } else {
        document.execCommand('copy', true, account);
      } 
      setCopiedFlag(true);
      setTimeout(function(){ 
        setCopiedFlag(false);
      }, 4000);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setCtn(document.getElementById('main-wrap'));

    injected.isAuthorized()
    .then((isAuthorized) => {
      if (isAuthorized && !active) {
        connectToWallet();
      }
    })
    .catch((error) => {
      console.log(error);
    })
  });

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const { invert, t } = props;
  return (
    <div className={classes.setting}>
      <IconButton
        aria-describedby={id}
        aria-label="Settings"
        onClick={handleClick}
        className={
          clsx(
            classes.icon,
            open && classes.active,
            invert && classes.invert
          )
        }
      >
        <AccountBalanceWallet fontSize="large" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        container={ctn}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}        
      >
        <List
          component="nav"
          className={classes.modeMenu}
          aria-label="Mode-menu"
          subheader={(
            <ListSubheader component="div">
              {/* {t('common:crypto-landing.header_theme')} */}
              My Wallet
            </ListSubheader>
          )}
        >
          <ListItem key="MyWallet">
            {!active && <Typography component="div">
              Connect with one of available wallet providers.
            </Typography>}
            {active && <div>
              <span>
                Connected With: {shortAddress(account)}
              </span>
              <Tooltip title={copiedFlag ? "Copied" : "Copy To Clipboard"}>
                <IconButton aria-label="copy" size="small" onClick={copyAddressToClipboard}>
                  <FileCopy fontSize="small"/>
                </IconButton>
              </Tooltip>              
            </div>}
          </ListItem>
          {active && tokens.length > 0 && <ListItem key="MyTokens">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">My Tokens</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                className={classes.Tokens}
                id="demo-simple-select"
                value={1}
                label="My Tokens"
                defaultValue={1}
              >
              {tokens.map((_token, index) => (
                <MenuItem value={index}>{getItemNameFromId(_token.id)}: {_token.amount}</MenuItem>
              ))}
              </Select>
            </FormControl>            
          </ListItem>}
        </List>
        <Divider />
        <List
          component="nav"
          className={classes.langMenu}
          aria-label="Language-menu"
          subheader={(
            <ListSubheader component="div">
              {/* {t('common:crypto-landing.header_language')} */}
              Providers
            </ListSubheader>
          )}
        >
          {wallet_providers.map(val => (
            <ListItem
              key={val.name}
              role={undefined}
              dense
              button
              onClick={() => handleChangeWallet(val)}
            >
              <ListItemIcon>
                <img src={val.icon} alt="thumb" className={classes.walleticon}/>
              </ListItemIcon>
              <ListItemText primary={val.name} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
}

Wallet.propTypes = {
  toggleDark: PropTypes.func.isRequired,
  toggleDir: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  invert: PropTypes.bool,
};

Wallet.defaultProps = {
  invert: false
};

export default withTranslation(['common', 'crypto-landing'])(Wallet);
