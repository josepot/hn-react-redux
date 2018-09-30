import React from 'react';
import PropTypes from 'prop-types';
import {styled} from 'styletron-react';
import {Link as RouterLink} from 'react-router-dom';

import {COLORS, LISTS_ORDER} from 'config';
import logo from './logo.svg';

const Wrapper = styled('header', {
  backgroundColor: COLORS.PRIMARY.DARK,
  position: 'fixed',
  zIndex: 999,
  height: '60px',
  top: 0,
  left: 0,
  right: 0,
});

const Inner = styled('nav', {
  maxWidth: '800px',
  boxSizing: 'border-box',
  margin: '0 auto',
  padding: '15px 5px',
});

const RouteWrapper = styled(RouterLink, ({isLogo}) => ({
  display: 'inline-block',
  width: '16.666%',
  verticalAlign: 'middle',
  lineHeight: isLogo ? '0' : '24px',
  textAlign: 'center',
}));

const Link = styled('span', ({active}) => ({
  color: active ? COLORS.SECONDARY.NORMAL : 'white',
  fontWeight: active ? 800 : 600,
  fontSize: '1.2em',
  transition: 'color 0.2s ease',
}));

const Img = styled('svg', {
  width: '35px',
  height: '35px',
  padding: '0',
});

const links = LISTS_ORDER.map(key => {
  const title = key.slice(0, 1).toUpperCase().concat(key.slice(1));
  return {key, title};
});

export default function HeaderComponent({activeKey}) {
  return (
    <Wrapper>
      <Inner>
        <RouteWrapper isLogo to="/">
          <Img
            role="img"
            aria-label="Homepage"
            dangerouslySetInnerHTML={{__html: logo}}
          />
        </RouteWrapper>
        {links.map(({title, key}, idx) =>
          <RouteWrapper key={key} to={`/${key}`}>
            <Link last={idx === links.length - 1} active={key === activeKey}>
              {title}
            </Link>
          </RouteWrapper>
        )}
      </Inner>
    </Wrapper>
  );
}

HeaderComponent.propTypes = {activeKey: PropTypes.string.isRequired};
