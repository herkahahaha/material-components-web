/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {assert} from 'chai';
import bel from 'bel';
import domEvents from 'dom-events';
import td from 'testdouble';

import {strings} from '../../../packages/mdc-toolbar/constants';
import {MDCToolbar} from '../../../packages/mdc-toolbar/index';

function getFixture() {
  return bel`
    <div>
      <header class="mdc-toolbar mdc-toolbar--flexible mdc-toolbar--flexible-default-behavior">
        <div class="mdc-toolbar__row">
          <section class="mdc-toolbar__section mdc-toolbar__section--align-start">
            <a class="material-icons">menu</a>
            <span class="mdc-toolbar__title">Title</span>
          </section>
          <section class="mdc-toolbar__section mdc-toolbar__section--align-end" role="toolbar">
            <a class="material-icons" aria-label="Download" alt="Download">file_download</a>
            <a class="material-icons" aria-label="Print this page" alt="Print this page">print</a>
            <a class="material-icons" aria-label="Bookmark this page" alt="Bookmark this page">bookmark</a>
          </section>
        </div>
      </header>
      <main class="mdc-toolbar-fixed-adjust">
      </main>
    </div>
  `;
}

function setupTest() {
  const fixture = getFixture();
  const root = fixture.querySelector('.mdc-toolbar');
  const adjust = fixture.querySelector('.mdc-toolbar-fixed-adjust');
  const component = new MDCToolbar(root);
  return {root, adjust, component};
}

suite('MDCToolbar');

test('attachTo initializes and returns an MDCToolbar instance', () => {
  assert.isOk(MDCToolbar.attachTo(getFixture()) instanceof MDCToolbar);
});

test('adapter#hasClass returns true if the root element has specified class', () => {
  const {root, component} = setupTest();
  root.classList.add('foo');
  assert.isOk(component.getDefaultFoundation().adapter_.hasClass('foo'));
});

test('adapter#hasClass returns false if the root element does not have specified class', () => {
  const {component} = setupTest();
  assert.isNotOk(component.getDefaultFoundation().adapter_.hasClass('foo'));
});

test('adapter#addClass adds a class to the root element', () => {
  const {root, component} = setupTest();
  component.getDefaultFoundation().adapter_.addClass('foo');
  assert.isOk(root.classList.contains('foo'));
});

test('adapter#removeClass removes a class from the root element', () => {
  const {root, component} = setupTest();
  root.classList.add('foo');
  component.getDefaultFoundation().adapter_.removeClass('foo');
  assert.isNotOk(root.classList.contains('foo'));
});

test('adapter#registerScrollHandler registers the handler for scroll', () => {
  const {component} = setupTest();
  const handler = td.func('scrollHandler');
  component.getDefaultFoundation().adapter_.registerScrollHandler(handler);
  domEvents.emit(window, 'scroll');
  try {
    td.verify(handler(td.matchers.anything()));
  } finally {
    // Just to be safe
    window.removeEventListener('resize', handler);
  }
});

test('adapter#deregisterScrollHandler unlistens the handler for scroll', () => {
  const {component} = setupTest();
  const handler = td.func('scrollHandler');
  window.addEventListener('scroll', handler);
  component.getDefaultFoundation().adapter_.deregisterScrollHandler(handler);
  domEvents.emit(window, 'scroll');
  try {
    td.verify(handler(td.matchers.anything()), {times: 0});
  } finally {
    // Just to be safe
    window.removeEventListener('resize', handler);
  }
});

test('adapter#registerResizeHandler registers the handler for window resize', () => {
  const {component} = setupTest();
  const handler = td.func('resizeHandler');
  component.getDefaultFoundation().adapter_.registerResizeHandler(handler);
  domEvents.emit(window, 'resize');
  try {
    td.verify(handler(td.matchers.anything()));
  } finally {
    // Just to be safe
    window.removeEventListener('resize', handler);
  }
});

test('adapter#deregisterResizeHandler unlistens the handler for window resize', () => {
  const {component} = setupTest();
  const handler = td.func('resizeHandler');
  window.addEventListener('resize', handler);
  component.getDefaultFoundation().adapter_.deregisterResizeHandler(handler);
  domEvents.emit(window, 'resize');
  try {
    td.verify(handler(td.matchers.anything()), {times: 0});
  } finally {
    // Just to be safe
    window.removeEventListener('resize', handler);
  }
});

test('adapter#getViewportWidth returns the width of viewport', () => {
  const {component} = setupTest();
  assert.equal(component.getDefaultFoundation().adapter_.getViewportWidth(), window.innerWidth);
});

test('adapter#getViewportScrollY returns scroll distance', () => {
  const {component} = setupTest();
  assert.equal(component.getDefaultFoundation().adapter_.getViewportScrollY(), window.pageYOffset);
});

test('adapter#getOffsetHeight returns the height of the toolbar', () => {
  const {root, component} = setupTest();
  assert.equal(component.getDefaultFoundation().adapter_.getOffsetHeight(), root.offsetHeight);
});

test('adapter#getFirstRowElementOffsetHeight returns the height of the first row', () => {
  const {root, component} = setupTest();
  const firstRowElement = root.querySelector(strings.FIRST_ROW_SELECTOR);
  assert.equal(component.getDefaultFoundation().adapter_.getFirstRowElementOffsetHeight(),
    firstRowElement.offsetHeight);
});

test(`adapter#notifyChange emits ${strings.CHANGE_EVENT}`, () => {
  const {component} = setupTest();

  const handler = td.func('changeHandler');

  component.listen(strings.CHANGE_EVENT, handler);
  component.getDefaultFoundation().adapter_.notifyChange();

  td.verify(handler(td.matchers.anything()));
});

test('adapter#setStyle sets the correct style on root element', () => {
  const {root, component} = setupTest();
  component.getDefaultFoundation().adapter_.setStyle('transform', 'translateY(-56px)');
  assert.equal(root.style.getPropertyValue('transform'), 'translateY(-56px)');
});

test('adapter#setStyleForTitleElement sets the correct style on title element', () => {
  const {root, component} = setupTest();
  const titleElement = root.querySelector(strings.TITLE_SELECTOR);
  component.getDefaultFoundation().adapter_.setStyleForTitleElement('transform', 'translateY(-56px)');
  assert.equal(titleElement.style.getPropertyValue('transform'), 'translateY(-56px)');
});

test('adapter#setStyleForFlexibleRowElement sets the correct style on flexible row element', () => {
  const {root, component} = setupTest();
  const flexibleRowElement = root.querySelector(strings.FIRST_ROW_SELECTOR);
  component.getDefaultFoundation().adapter_.setStyleForFlexibleRowElement('height', '56px');
  assert.equal(flexibleRowElement.style.getPropertyValue('height'), '56px');
});

test('adapter#setStyleForFixedAdjustElement sets the correct style on fixed adjust element', () => {
  const {adjust, component} = setupTest();
  component.fixedAdjustElement = adjust;
  component.getDefaultFoundation().adapter_.setStyleForFixedAdjustElement('margin-top', '-56px');
  assert.equal(adjust.style.getPropertyValue('margin-top'), '-56px');
});

test('adapter#setStyleForFixedAdjustElement works even if fixedAdjustElement not provided', () => {
  const {adjust, component} = setupTest();
  component.getDefaultFoundation().adapter_.setStyleForFixedAdjustElement('marginTop', '-56px');
  assert.equal(adjust.style.getPropertyValue('margin-top'), '');
});
