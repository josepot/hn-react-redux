import {withProps} from 'recompose';

const getUrlData = ({url}) => {
  if (!url) return {};

  const [protocol, path] = url.split('://');
  const [domain] = path.split('/');

  const isSafe = protocol === 'http'
    ? false
    : protocol === 'https' ? true : null;

  return {domain, isSafe};
};

export default withProps(getUrlData);
