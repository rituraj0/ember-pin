import Ember from 'ember';
import layout from '../templates/components/pinned-content';

const { Component, inject, computed, String: { htmlSafe }, run } = Ember;

export default Component.extend({
  classNames: ['pinned-content'],
  attributeBindings: ['style'],
  top: null,
  bottom: null,
  windoc: inject.service(),
  layout,
  _unfixedWidth: null,
  didInsertElement() {
    this._super(...arguments);
    this._saveUnfixedWidth();
    run.scheduleOnce('afterRender', () => {
      this.set('_initialOffsetTop', this.$().offset().top);
      this.set('_initialOffsetLeft', this.$().offset().left);
    });
  },

  _saveUnfixedWidth() {
    if (this.$() && !(this.get('_fixedToTop') || this.get('_fixedToBottom'))) {
      this.set('_unfixedWidth', this.$().width());
    }
  },

  _fixedToTop: computed('_initialOffsetTop', 'windoc.scrollTop', 'top', function() {
    if (this.get('top') === null) {
      run.debounce(this, '_saveUnfixedWidth', 10);
      return false;
    } else {
      return (this.get('windoc.scrollTop') + this.get('top')) > this.get('_initialOffsetTop');
    }
  }),

  _fixedToBottom: computed('_initialOffsetTop', 'windoc.clientHeight', 'windoc.scrollBottom', 'bottom', function() {
    if (this.get('bottom') === null) {
      run.debounce(this, '_saveUnfixedWidth', 10);
      return false;
    } else {
      // let x = (this.get('windoc.scrollHeight') - this.get('_initialOffsetTop'));
      let y = (this.get('windoc.scrollBottom') + this.get('bottom'));
      return y > this.get('bottom');
    }
  }),

  style: computed('_initialOffsetTop', '_initialOffsetLeft', 'top', 'bottom', '_fixedToTop', '_fixedToBottom', function() {
    if (this.element) {
      let cssAttrs = [];
      if (this.get('_fixedToTop')) {
        cssAttrs.push(['position', 'fixed']);
        cssAttrs.push(['top', `${this.get('top')}px`]);
        cssAttrs.push(['left', `${this.get('_initialOffsetLeft')}px`]);
        if (this.get('_unfixedWidth')) {
          cssAttrs.push(['width', `${this.get('_unfixedWidth')}px`]);
        }
      } else if (this.get('_fixedToBottom')) {
        cssAttrs.push(['position', 'fixed']);
        cssAttrs.push(['bottom', `${this.get('bottom')}px`]);
        cssAttrs.push(['left', `${this.get('_initialOffsetLeft')}px`]);
        if (this.get('_unfixedWidth')) {
          cssAttrs.push(['width', `${this.get('_unfixedWidth')}px`]);
        }
      }
      return htmlSafe(cssAttrs.map((attr) => {
        return `${attr[0]}: ${attr[1]}`;
      }).join('; '));
    } else {
      return htmlSafe('');
    }
  })
});
