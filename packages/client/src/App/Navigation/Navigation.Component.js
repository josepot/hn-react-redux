import React from 'react';
import {NavLink as UnstyledNavLink} from 'react-router-dom';
import {Header, Nav, Link, activeLink} from './Navigation.Styles';

const NavLink = Link.withComponent(UnstyledNavLink);

export default function Navigation() {
  return (
    <Header>
      <Nav>
        <NavLink activeClassName={activeLink} to="/list">
          List
        </NavLink>
        <NavLink activeClassName={activeLink} to="/new">
          New
        </NavLink>
      </Nav>
    </Header>
  );
}
