import { loginActions } from './components/Login/LoginSlice';

export const printSessionStorage = () => {
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    console.log(`Key: ${key}, Value: ${value}`);
  }
};

/**
 * set an item in sessionStorage with a custom timeout
 * @param {string} key - the key of the item
 * @param {*} value - value of the item, an object
 * @param {number} time - time until expiration, in minutes
 */
export const setItemWithTimeout = (key, value, time) => {
  const now = new Date();
  const timeInMilliseconds = time * 60 * 1000;
  const item = {
    value: value,
    expiry: now.getTime() + timeInMilliseconds
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};

/**
 * get an item with timeout in sessionStorage
 * @param {string} key
 */
export const getItemWithTimeout = (key) => {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  // remove the data if it's expired
  if (now.getTime() > item.expiry) {
    sessionStorage.removeItem(key);
    return null;
  }
  return item.value;
};

export const authExpire = (dispatch, navigate) => {
  dispatch(
    loginActions.setErrorMsg(
      'Your authentication key has expired. Please try again.'
    )
  );
  navigate('/');
};
