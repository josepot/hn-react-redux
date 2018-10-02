import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {omit} from 'ramda';

const DEBOUNCE_TIME = 100;

export default BaseComponent =>
  class WithScrollOnBottom extends Component {
    static propTypes = {
      ...Component.propTypes,
      onScrollBottom: PropTypes.func,
    };

    constructor() {
      super();
      this.maxTop = Infinity;
    }

    scrollCheck = container => {
      try {
        if (container.scrollTop <= this.maxTop) return;
        const {children} = container;
        const lastChild = children[children.length - 1];

        const containerRect = container.getBoundingClientRect();
        const lastChildRect = lastChild.getBoundingClientRect();

        if (lastChildRect.top <= containerRect.top + containerRect.height) {
          const {onScrollBottom} = this.props;
          onScrollBottom();
        }
      } finally {
        this.timmerId = undefined;
        this.maxTop = Infinity;
      }
    };

    scrollHandler = e => {
      if (this.timmerId !== undefined) clearTimeout(this.timmerId);
      this.maxTop = Math.min(e.target.scrollTop, this.maxTop);
      this.timmerId = setTimeout(this.scrollCheck, DEBOUNCE_TIME, e.target);
    };

    render() {
      this.cbEnabled = false;
      return (
        <BaseComponent
          onScroll={this.scrollHandler}
          {...omit(['onScrollBottom'], this.props)}
        />
      );
    }
  };
