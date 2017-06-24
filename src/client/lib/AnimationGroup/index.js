import chain from 'chain-function';
import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import warning from 'warning';

import { getChildMapping, mergeChildMappings } from './ChildMapping';

const propTypes = {
  component: PropTypes.any,
  childFactory: PropTypes.func,
  children: PropTypes.node,
  comingFrom: PropTypes.oneOf(['LEFT', 'RIGHT']),
  leavingTowards: PropTypes.oneOf(['LEFT', 'RIGHT']),
  onAnimationsStart: PropTypes.func,
  onAnimationsEnd: PropTypes.func,
};

const defaultProps = {
  component: 'div',
  childFactory: child => child,
  comingFrom: 'LEFT',
  leavingTowards: 'RIGHT',
  onAnimationsStart: Function.prototype,
  onAnimationsEnd: Function.prototype,
};

const waitForAnimationFrame = () => new Promise(requestAnimationFrame);

const calculateAnimations = (
  keys, startingPositions, realPositions,
  endingPositions, comingFrom, leavingTowards
) => {
  // Calculating the animations
  let animations = {};
  keys.forEach(key => {
    const first = startingPositions[key];
    const real = realPositions[key];
    const last = endingPositions[key];


    const appearLeft = comingFrom === 'LEFT'
      ? (real.width * -1)
      : comingFrom === 'RIGHT'
        ? window.innerWidth
        : last.left;

    const leaveLeft = leavingTowards === 'RIGHT'
      ? window.innerWidth
      : leavingTowards === 'LEFT'
        ? (real.width * -1)
        : first.left;

    const isAppearing = (!first.height && !first.width);
    const isLeaving = (!last.height && !last.width);

    let [startLeft, startTop] = isAppearing
      ? [appearLeft, last.top]
      : [first.left, first.top];

    let [endLeft, endTop] = isLeaving
      ? [leaveLeft, first.top]
      : [last.left, last.top];

    if (
      isAppearing || isLeaving || startLeft !== endLeft ||
      startTop !== endTop ||
      endLeft !== real.left || endTop !== real.top
    ) {
      animations[key] = [
        {
          transform: `translate(${startLeft - real.left}px, ${startTop - real.top}px)`,
          opacity: isAppearing ? 0 : 1,
        },
        {
          transform: `translate(${endLeft - real.left}px, ${endTop - real.top}px)`,
          opacity: isLeaving ? 0 : 1,
        }
      ];
    }
  });
  return animations;
};

class AnimationGroup extends React.Component {
  static displayName = 'AnimationGroup';

  constructor(props, context) {
    super(props, context);

    this.childRefs = Object.create(null);
    this.children = getChildMapping(props.children);

    this.state = {
      children: this.children,
    };
  }

  componentWillMount() {
    this.animations = {};
    this.startingPositions = {};
    this.domNodes = {};
  }

  componentDidMount() {
    this.updateDomNodes();
  }

  componentWillReceiveProps(nextProps) {
    let nextChildMapping = getChildMapping(nextProps.children);
    let prevChildMapping = this.state.children;
    this.children = mergeChildMappings(prevChildMapping, nextChildMapping);

    this.setState({ children: this.children });

    this.leavingKeys = {};
    Object.keys(prevChildMapping).forEach(key => {
      const hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext) {
        this.leavingKeys[key] = true;
      }
    });
  }

  componentWillUpdate() {
    this.updateDomNodes();

    // Take a snapshot of the position of each child before the update
    this.startingPositions = this.takeSnapshot();
  }


  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;

    this.updateDomNodes();
    Object.keys(this.animations)
      .forEach(key => this.animations[key].cancel());

    const realPositions = this.takeSnapshot();
    const originalDisplays = {};

    // Hiding all the nodes that will end up disapearring, so that we can
    // take a snapshot of the final position of each node.
    Object.keys(this.leavingKeys).forEach(key => {
      const domNode = this.domNodes[key];
      if (domNode) {
        originalDisplays[key] = domNode.style.display;
        domNode.style.display = 'none';
      }
    });

    const endingPositions = this.takeSnapshot();
    // Restoring the original display values
    Object.keys(originalDisplays).forEach(key => {
      this.domNodes[key].style.display = originalDisplays[key];
    });

    const animations = calculateAnimations(
      Object.keys(this.children).filter(key => this.domNodes[key]),
      this.startingPositions,
      realPositions,
      endingPositions,
      this.props.comingFrom,
      this.props.leavingTowards
    );

    // creating the animations with their "cancelation" functions
    if (Object.keys(animations).length > 0) this.props.onAnimationsStart();
    Object.keys(animations).forEach((key) => {
      const animation = animations[key];
      this.animations[key] = {
        start: animation[0],
        end: animation[1],
        cancel: () => {
          this.domNodes[key].style.transition = '';
          this.domNodes[key].style.transform = '';
          this.domNodes[key].style.opacity = '';
          delete this.animations[key];
        },
      };
    });

    waitForAnimationFrame().then(() => {
      Object.keys(this.animations).forEach((key) => {
        // starting the animation
        this.domNodes[key].style.transition = '';
        this.domNodes[key].style.transform = this.animations[key].start.transform;
        this.domNodes[key].style.opacity = this.animations[key].start.opacity;
      });
    })
    .then(waitForAnimationFrame)
    .then(() => {
      Object.keys(this.animations).forEach(key => {
        this.domNodes[key].style.transition = 'all 0.25s ease-out';
        this.domNodes[key].style.transform = this.animations[key].end.transform;
        this.domNodes[key].style.opacity = this.animations[key].end.opacity;
        this.domNodes[key].addEventListener('transitionend', () => {
          if (this.animations[key]) this.animations[key].cancel();
          if (this.leavingKeys[key]) {
            delete this.children[key];
            delete this.childRefs[key];
            delete this.domNodes[key];
            delete this.leavingKeys[key];
            if (Object.keys(this.leavingKeys).length === 0) {
              Object.keys(this.animations)
                .forEach(aKey => this.animations[aKey].cancel());
              this.props.onAnimationsEnd();
              this.setState({ children: this.children });
            }
          }
        });
      });
    });
  }

  updateDomNodes() {
    Object.keys(this.children).forEach(key => {
      this.domNodes[key] = ReactDom.findDOMNode(this.childRefs[key]);
    });
  }

  takeSnapshot(wait = true) {
    return Object
      .keys(this.children)
      .reduce((result, key) => {
        result[key] = this.domNodes[key]
          ? this.domNodes[key].getBoundingClientRect()
          : {};
        return result;
      }, {});
  }

  render() {
    let childrenToRender = [];
    Object.keys(this.state.children).forEach(key => {
      let child = this.state.children[key];
      if (child) {
        let isCallbackRef = typeof child.ref !== 'string';
        let factoryChild = this.props.childFactory(child);
        let ref = (r) => {
          this.childRefs[key] = r;
        };

        warning(isCallbackRef,
          'string refs are not supported on children of AnimationGroup and will be ignored. ' +
          'Please use a callback ref instead: https://facebook.github.io/react/docs/refs-and-the-dom.html#the-ref-callback-attribute');

        // Always chaining the refs leads to problems when the childFactory
        // wraps the child. The child ref callback gets called twice with the
        // wrapper and the child. So we only need to chain the ref if the
        // factoryChild is not different from child.
        if (factoryChild === child && isCallbackRef) {
          ref = chain(child.ref, ref);
        }

        // You may need to apply reactive updates to a child as it is leaving.
        // The normal React way to do it won't work since the child will have
        // already been removed. In case you need this behavior you can provide
        // a childFactory function to wrap every child, even the ones that are
        // leaving.
        childrenToRender.push(React.cloneElement(
          factoryChild,
          {
            key,
            ref,
          },
        ));
      }
    });

    // Do not forward AnimationGroup props to primitive DOM nodes
    let props = Object.assign({}, this.props);
    delete props.transitionLeave;
    delete props.transitionName;
    delete props.transitionAppear;
    delete props.transitionEnter;
    delete props.childFactory;
    delete props.transitionLeaveTimeout;
    delete props.transitionEnterTimeout;
    delete props.transitionAppearTimeout;
    delete props.component;

    return React.createElement(
      this.props.component,
      props,
      childrenToRender,
    );
  }
}

AnimationGroup.propTypes = propTypes;
AnimationGroup.defaultProps = defaultProps;

export default AnimationGroup;
