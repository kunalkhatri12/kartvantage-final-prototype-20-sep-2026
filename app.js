(function () {
  'use strict';

  var state = { page: 'overview', role: 'merchant', rulesTab: 'library', settingsTab: 'general', configType: 'order', ruleId: null, pendingRuleId: null, cartModule: 'progress', cartState: 'issue', cartQuantity: 2, cartSubtotal: 29, offerAdded: false, publishOutcome: 'confirmed', allRulesSelected: false };
  var persistedRuleTypes = {
    r_01K5Q9G7E4M2X8N6P3T0VYH1CZ: 'order',
    r_01K5Q9H2A7D4M8R6X1N3T0VPYF: 'product',
    r_01K5Q9J6C2V8N4M7T1X3P0HYDZ: 'cart',
    r_01K5Q9K1F7R3M8V2N6X4T0YPHA: 'order'
  };
  var settingsTabLabels = { general: 'General', storefront: 'Storefront', notifications: 'Notifications', activity: 'Health & activity', privacy: 'Privacy & data', support: 'Support' };
  var rolePages = {
    merchant: ['overview', 'rules', 'config', 'cart', 'plans', 'settings', 'insights', 'health'],
    operations: ['control', 'merchants', 'success', 'incidents'],
    support: ['support-centre', 'merchant360', 'runbooks']
  };
  var roleHomes = { merchant: 'overview', operations: 'control', support: 'support-centre' };
  var config = {
    order: {
      title: 'Order value limits',
      subtitle: 'Control the minimum and maximum eligible cart value.',
      name: 'Order Minimum $50',
      unit: '$', min: '50', max: '500',
      minHelp: 'Require the eligible cart value to reach this amount.',
      maxHelp: 'Prevent the eligible cart value from exceeding this amount.',
      previewTitle: 'Add $21.00 more to continue',
      previewBody: 'Your order must reach $50.00 before checkout.'
    },
    product: {
      title: 'Product quantity limits',
      subtitle: 'Control the minimum and maximum quantity allowed per product.',
      name: 'Holiday product limit',
      unit: 'Qty', min: '1', max: '4',
      minHelp: 'Require at least this quantity for each eligible product.',
      maxHelp: 'Prevent each eligible product from exceeding this quantity.',
      previewTitle: 'Reduce this item to 4',
      previewBody: 'You can purchase up to 4 of this product.'
    },
    cart: {
      title: 'Total cart item limits',
      subtitle: 'Control the minimum and maximum number of items in the cart.',
      name: 'Cart item range',
      unit: 'Items', min: '2', max: '20',
      minHelp: 'Require the cart to contain at least this many items.',
      maxHelp: 'Prevent the cart from containing more than this many items.',
      previewTitle: 'Add 1 more item to continue',
      previewBody: 'Your cart must contain at least 2 items before checkout.'
    }
  };
  var cartConfig = {
    progress: { title: 'Cart Progress', description: 'Display progress toward the closest active rule.', message: "You're {{remaining}} away from checkout", help: 'Use {{remaining}} to show the amount still needed.', style: 'bar', alignment: 'full' },
    offer: { title: 'Cart Offer', description: 'Recommend an eligible product that helps the shopper meet the rule.', message: 'Add {{product}} and get closer to checkout', help: 'Use {{product}} to show the selected recommendation.', style: 'banner', alignment: 'contained' },
    summary: { title: 'Cart Summary', description: 'Summarise active purchase-rule status before checkout.', message: '{{status}}', help: 'Use {{status}} to show whether the cart is ready.', style: 'compact', alignment: 'full' }
  };

  function all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function one(selector) { return document.querySelector(selector); }
  function setText(selector, value) { var el = one(selector); if (el) el.textContent = value; }

  function closeCustomSelects(except) {
    all('.custom-select.open').forEach(function (dropdown) {
      if (dropdown === except) return;
      dropdown.classList.remove('open');
      dropdown.querySelector('.custom-select-trigger').setAttribute('aria-expanded', 'false');
      dropdown.querySelector('.custom-select-menu').hidden = true;
    });
  }

  function syncCustomSelect(select) {
    if (!select || !select._customSelect) return;
    var selected = select.options[select.selectedIndex];
    select._customSelect.value.textContent = selected ? selected.textContent : 'Select';
    select._customSelect.options.forEach(function (option, index) {
      var active = index === select.selectedIndex;
      option.classList.toggle('selected', active);
      option.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function enhanceSelect(select, index) {
    if (select._customSelect) return;
    var label = select.getAttribute('aria-label') || ((document.querySelector('label[for="' + select.id + '"]') || {}).textContent || 'Choose an option').trim();
    var dropdown = document.createElement('div');
    dropdown.className = 'custom-select';
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-label', label);
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    var value = document.createElement('span');
    value.className = 'custom-select-value';
    var chevron = document.createElement('span');
    chevron.className = 'custom-select-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.appendChild(value);
    trigger.appendChild(chevron);
    var menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.id = 'custom-select-menu-' + index;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', label);
    menu.hidden = true;
    trigger.setAttribute('aria-controls', menu.id);
    var optionButtons = Array.prototype.map.call(select.options, function (nativeOption, optionIndex) {
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'custom-select-option';
      option.setAttribute('role', 'option');
      option.setAttribute('data-value', nativeOption.value);
      option.textContent = nativeOption.textContent;
      option.disabled = nativeOption.disabled;
      option.addEventListener('click', function () {
        select.selectedIndex = optionIndex;
        syncCustomSelect(select);
        select.dispatchEvent(new Event('change', { bubbles: true }));
        closeCustomSelects();
        trigger.focus();
      });
      option.addEventListener('keydown', function (event) {
        var enabled = optionButtons.filter(function (item) { return !item.disabled; });
        var current = enabled.indexOf(option);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          enabled[(current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length].focus();
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          enabled[event.key === 'Home' ? 0 : enabled.length - 1].focus();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeCustomSelects();
          trigger.focus();
        }
      });
      menu.appendChild(option);
      return option;
    });
    select.parentNode.insertBefore(dropdown, select);
    dropdown.appendChild(select);
    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);
    select.classList.add('native-select-proxy');
    select.setAttribute('aria-hidden', 'true');
    select.tabIndex = -1;
    select._customSelect = { dropdown: dropdown, trigger: trigger, value: value, menu: menu, options: optionButtons };
    trigger.addEventListener('click', function () {
      var opening = !dropdown.classList.contains('open');
      closeCustomSelects(opening ? dropdown : null);
      dropdown.classList.toggle('open', opening);
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
      menu.hidden = !opening;
      if (opening) (optionButtons[select.selectedIndex] || optionButtons[0]).focus();
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!dropdown.classList.contains('open')) trigger.click();
      }
    });
    var wrappingLabel = dropdown.closest('label');
    if (wrappingLabel) wrappingLabel.addEventListener('click', function (event) {
      if (!event.target.closest('.custom-select')) {
        event.preventDefault();
        trigger.click();
      }
    });
    var externalLabel = select.id ? document.querySelector('label[for="' + select.id + '"]') : null;
    if (externalLabel && externalLabel !== wrappingLabel) externalLabel.addEventListener('click', function (event) {
      event.preventDefault();
      trigger.focus();
      trigger.click();
    });
    syncCustomSelect(select);
  }

  function enhanceSelects() {
    all('select').forEach(enhanceSelect);
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.custom-select')) closeCustomSelects();
    });
  }

  function toast(message) {
    var region = one('#toast-region');
    var item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(function () {
      item.classList.add('toast-out');
      window.setTimeout(function () { item.remove(); }, 200);
    }, 3000);
  }

  function showModal(selector, focusSelector) {
    var modal = one(selector);
    window.clearTimeout(modal._closeTimer);
    modal._returnFocus = document.activeElement;
    modal.removeAttribute('inert');
    modal.classList.remove('hide', 'is-closing');
    modal.setAttribute('aria-hidden', 'false');
    var focusTarget = focusSelector ? modal.querySelector(focusSelector) : null;
    if (focusTarget) focusTarget.focus();
  }

  function hideModal(selector) {
    var modal = one(selector);
    if (modal.classList.contains('hide') || modal.classList.contains('is-closing')) return;
    modal.classList.add('is-closing');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    modal._closeTimer = window.setTimeout(function () {
      modal.classList.add('hide');
      modal.classList.remove('is-closing');
      if (modal._returnFocus && document.contains(modal._returnFocus)) modal._returnFocus.focus();
    }, 200);
  }

  var sidebarCompact = window.innerWidth <= 980;

  function setSidebar(open) {
    var compact = window.innerWidth <= 980;
    if (!compact) open = true;
    var menu = one('#menu-toggle');
    one('#app').classList.toggle('sidebar-collapsed', !open);
    one('#mobile-overlay').classList.toggle('open', open && compact);
    menu.textContent = open && compact ? '×' : '☰';
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  function closeMobileNav() {
    if (window.innerWidth <= 980) setSidebar(false);
    else one('#mobile-overlay').classList.remove('open');
  }

  function roleForPage(page) {
    return Object.keys(rolePages).filter(function (role) { return rolePages[role].indexOf(page) !== -1; })[0] || 'merchant';
  }

  function setRole(role, keepPage) {
    state.role = role;
    one('#role-switch').value = role;
    syncCustomSelect(one('#role-switch'));
    all('[data-role-nav]').forEach(function (nav) { nav.classList.toggle('hide', nav.getAttribute('data-role-nav') !== role); });
    all('[data-merchant-only]').forEach(function (element) { element.classList.toggle('hide', role !== 'merchant'); });
    if (!keepPage) navigate(roleHomes[role]);
  }

  function navigate(page, fromHash) {
    if (rolePages[state.role].indexOf(page) === -1) setRole(roleForPage(page), true);
    state.page = page;
    all('[data-page-panel]').forEach(function (panel) {
      panel.classList.toggle('hide', panel.getAttribute('data-page-panel') !== page);
    });
    all('.nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-page') === page || (page === 'config' && item.getAttribute('data-page') === 'rules'));
    });
    closeMobileNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page !== 'config' && !fromHash && window.location.hash !== '#' + page) window.location.hash = page;
  }

  function showRulesTab(tab) {
    state.rulesTab = tab;
    navigate('rules');
    all('[data-rules-panel]').forEach(function (panel) {
      panel.classList.toggle('hide', panel.getAttribute('data-rules-panel') !== tab);
    });
    var toggle = one('#rules-view-toggle');
    toggle.textContent = tab === 'test' ? 'Open rule library' : 'Open test lab';
    toggle.setAttribute('data-rules-tab', tab === 'test' ? 'library' : 'test');
    one('#create-rule-button').classList.toggle('hide', tab === 'test');
  }

  function createOpaqueRuleId() {
    var raw = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID().replace(/-/g, '') : Date.now().toString(36) + Math.random().toString(36).slice(2);
    return 'r_' + raw.slice(0, 26).toUpperCase();
  }

  function rememberRuleType(ruleId, type) {
    persistedRuleTypes[ruleId] = type;
    try { window.sessionStorage.setItem('kv-rule-type:' + ruleId, type); } catch (error) { /* Prototype still works without storage. */ }
  }

  function ruleTypeForId(ruleId) {
    if (persistedRuleTypes[ruleId]) return persistedRuleTypes[ruleId];
    try { return window.sessionStorage.getItem('kv-rule-type:' + ruleId); } catch (error) { return null; }
  }

  function openNewRuleChooser(ruleId, fromRoute) {
    state.pendingRuleId = ruleId || createOpaqueRuleId();
    showModal('#new-rule-modal', '[data-action="close-new-rule"]');
    if (!fromRoute) window.location.hash = 'rules/' + state.pendingRuleId + '/new';
  }

  function closeNewRuleChooser() { hideModal('#new-rule-modal'); }
  function cancelNewRuleChooser() {
    closeNewRuleChooser();
    state.pendingRuleId = null;
    navigate('rules');
  }

  function visibleRuleRows() {
    return all('#rules-table tr').filter(function (row) { return !row.classList.contains('hide') && !row.classList.contains('archived'); });
  }

  function updateRuleSelection() {
    var selected = all('.rule-select:checked').filter(function (box) { return !box.closest('tr').classList.contains('archived'); });
    var total = all('.rule-select').filter(function (box) { return !box.closest('tr').classList.contains('archived'); }).length;
    if (state.allRulesSelected && total === 0) state.allRulesSelected = false;
    var selectedCount = state.allRulesSelected ? total : selected.length;
    setText('#selected-rule-count', String(selectedCount));
    one('#bulk-rule-actions').classList.toggle('hide', selectedCount === 0);
    one('#clear-rule-selection').classList.toggle('hide', selectedCount === 0);
    one('#select-all-store-rules').classList.toggle('hide', state.allRulesSelected);
    setText('#select-all-store-rules', 'Select all ' + total + ' rules');
    setText('#selection-scope-summary', state.allRulesSelected ? 'All ' + total + ' rules selected' : selectedCount ? selectedCount + ' selected' : 'None selected');
    var visible = visibleRuleRows();
    var pageSelected = visible.length > 0 && visible.every(function (row) { return row.querySelector('.rule-select').checked; });
    one('#select-all-rules').checked = pageSelected;
    one('#select-page-rules').checked = pageSelected;
    one('#select-all-rules').indeterminate = selectedCount > 0 && !pageSelected;
    one('#select-page-rules').indeterminate = selectedCount > 0 && !pageSelected;
  }

  function filterRules() {
    var query = one('#rule-search').value.toLowerCase().trim();
    var status = one('#rule-status-filter').value;
    all('[data-rule-row]').forEach(function (row) {
      var queryMatch = row.getAttribute('data-rule-row').indexOf(query) !== -1 || row.textContent.toLowerCase().indexOf(query) !== -1;
      var statusMatch = status === 'all' || row.getAttribute('data-status') === status;
      row.classList.toggle('hide', row.classList.contains('archived') || !queryMatch || !statusMatch);
    });
    updateRuleSelection();
  }

  function setRuleStatus(row, status) {
    row.setAttribute('data-status', status);
    var badge = row.querySelector('[data-rule-status]');
    badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    badge.className = status === 'published' ? 'badge published' : status === 'paused' ? 'badge warning' : 'badge';
    badge.setAttribute('data-rule-status', '');
    var stateButton = row.querySelector('[data-rule-action="pause"], [data-rule-action="publish"]');
    if (stateButton) {
      var nextAction = status === 'published' ? 'pause' : 'publish';
      stateButton.setAttribute('data-rule-action', nextAction);
      stateButton.textContent = nextAction.charAt(0).toUpperCase() + nextAction.slice(1);
    }
  }

  function applyRuleAction(row, action, silent) {
    var ruleName = row.querySelector('.rule-name strong').textContent;
    if (action === 'archive') {
      row.classList.add('archived', 'hide');
      row.querySelector('.rule-select').checked = false;
      if (!silent) toast(ruleName + ' archived in this prototype.');
    } else {
      setRuleStatus(row, action === 'pause' ? 'paused' : 'published');
      if (!silent) toast(ruleName + (action === 'pause' ? ' paused.' : ' published.'));
    }
    filterRules();
  }

  function closeSettingsMobileMenu() {
    var menu = one('#settings-mobile-menu');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');
    one('#settings-mobile-trigger').setAttribute('aria-expanded', 'false');
  }

  function toggleSettingsMobileMenu() {
    var menu = one('#settings-mobile-menu');
    var open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) menu.removeAttribute('inert');
    else menu.setAttribute('inert', '');
    one('#settings-mobile-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function showSettingsTab(tab) {
    state.settingsTab = tab;
    navigate('settings');
    all('[data-settings-panel]').forEach(function (panel) {
      panel.classList.toggle('hide', panel.getAttribute('data-settings-panel') !== tab);
    });
    all('[data-settings-tab]').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-settings-tab') === tab);
    });
    setText('#settings-mobile-current', settingsTabLabels[tab] || 'General');
    closeSettingsMobileMenu();
  }

  function openConfig(type, ruleId, fromRoute) {
    closeNewRuleChooser();
    state.configType = type;
    state.ruleId = ruleId || state.pendingRuleId || createOpaqueRuleId();
    state.pendingRuleId = null;
    rememberRuleType(state.ruleId, type);
    var data = config[type];
    setText('#config-title', data.title);
    setText('#config-subtitle', data.subtitle);
    setText('#limits-title', data.title);
    one('#rule-name').value = data.name;
    all('.unit-prefix').forEach(function (el) { el.textContent = data.unit; });
    one('#minimum-input').value = data.min;
    one('#maximum-input').value = data.max;
    setText('#minimum-help', data.minHelp);
    setText('#maximum-help', data.maxHelp);
    setText('#preview-message-title', data.previewTitle);
    setText('#preview-message-body', data.previewBody);
    updatePreviewFromMinimum();
    navigate('config', true);
    if (!fromRoute) window.location.hash = 'rules/' + state.ruleId + '/edit';
  }

  function updatePreviewFromMinimum() {
    var type = state.configType;
    var value = one('#minimum-input').value || config[type].min;
    if (type === 'order') {
      var remaining = Math.max(0, Number(value) - 29).toFixed(2);
      setText('#preview-message-title', 'Add $' + remaining + ' more to continue');
      setText('#preview-message-body', 'Your order must reach $' + Number(value).toFixed(2) + ' before checkout.');
      setText('#rule-progress-note', '$29.00 of $' + Number(value).toFixed(2));
      if (one('#rule-progress-fill')) one('#rule-progress-fill').style.width = Math.min(100, (29 / Math.max(1, Number(value))) * 100) + '%';
    } else if (type === 'product') {
      setText('#preview-message-title', 'Add ' + value + ' of this product');
      setText('#preview-message-body', 'This product requires a minimum quantity of ' + value + '.');
      setText('#rule-progress-note', 'Sample quantity 2 · minimum ' + value);
      if (one('#rule-progress-fill')) one('#rule-progress-fill').style.width = Math.min(100, (2 / Math.max(1, Number(value))) * 100) + '%';
    } else {
      setText('#preview-message-title', 'Add ' + value + ' items to continue');
      setText('#preview-message-body', 'Your cart must contain at least ' + value + ' items before checkout.');
      setText('#rule-progress-note', '2 cart items · minimum ' + value);
      if (one('#rule-progress-fill')) one('#rule-progress-fill').style.width = Math.min(100, (2 / Math.max(1, Number(value))) * 100) + '%';
    }
  }

  function openPublishReview() {
    setText('#publish-rule-name', one('#rule-name').value);
    var unit = state.configType === 'order' ? '$' : '';
    var suffix = state.configType === 'product' ? ' per product' : state.configType === 'cart' ? ' items' : '';
    setText('#publish-rule-limit', 'Minimum ' + config[state.configType].title.toLowerCase().replace(' limits', '') + ' · ' + unit + one('#minimum-input').value + suffix);
    one('#publish-state').classList.add('hide');
    one('[data-action="confirm-publish"]').disabled = false;
    one('[data-action="confirm-publish"]').textContent = 'Confirm & publish';
    showModal('#publish-modal', '[data-action="close-publish"]');
  }

  function closePublishReview() { hideModal('#publish-modal'); }

  function renderPublishOutcome(outcome) {
    var outcomes = {
      confirmed: ['Published and confirmed', 'Shopify confirmed the active configuration. Shoppers are now evaluated against this rule.', 'success'],
      uncertain: ['Confirmation is taking longer than expected', 'The publish intent is safely recorded. KartVantage will reconcile with Shopify before offering a retry.', 'warning'],
      failed: ['Publication failed', 'Nothing was presented as published. Review the diagnostic details, then retry when the issue is resolved.', 'failed']
    };
    var data = outcomes[outcome];
    one('#publish-state').classList.remove('hide');
    setText('#publish-state-title', data[0]);
    setText('#publish-state-copy', data[1]);
    one('#publish-state-orb').className = 'status-orb ' + data[2];
    var confirm = one('[data-action="confirm-publish"]');
    confirm.disabled = outcome === 'confirmed';
    confirm.textContent = outcome === 'confirmed' ? 'Published' : 'Retry publish';
  }

  function selectedOffer() {
    var option = one('#offer-product').value.split('|');
    return { name: option[0], price: Number(option[1]) };
  }

  function renderRuleMessage() {
    var type = state.configType;
    var minimum = Number(one('#minimum-input').value || config[type].min);
    var maximum = Number(one('#maximum-input').value || config[type].max);
    var remaining = type === 'order' ? '$' + Math.max(0, minimum - 29).toFixed(2) : String(Math.max(1, minimum));
    var text = one('#message-input').value
      .replace(/{{remaining}}/g, remaining)
      .replace(/{{minimum}}/g, type === 'order' ? '$' + minimum.toFixed(2) : String(minimum))
      .replace(/{{maximum}}/g, type === 'order' ? '$' + maximum.toFixed(2) : String(maximum))
      .replace(/{{product}}/g, 'Classic cotton tee')
      .replace(/{{itemCount}}/g, '2');
    var parts = text.split(/(?<=[.!?])\s+/);
    setText('#preview-message-title', parts.shift() || text);
    setText('#preview-message-body', parts.join(' ') || 'The shopper sees this guidance before checkout.');
  }

  function selectCartModule(module) {
    state.cartModule = module;
    var data = cartConfig[module];
    setText('#module-config-title', data.title);
    setText('#module-config-description', data.description);
    one('#cart-style').value = data.style;
    one('#cart-alignment').value = data.alignment;
    syncCustomSelect(one('#cart-style'));
    syncCustomSelect(one('#cart-alignment'));
    one('#cart-message').value = data.message;
    setText('#cart-message-help', data.help);
    one('#offer-product-field').classList.toggle('hide', module !== 'offer');
    all('[data-module-card]').forEach(function (card) { card.classList.toggle('active-module', card.getAttribute('data-module-card') === module); });
    all('[data-cart-module]').forEach(function (button) { button.textContent = button.getAttribute('data-cart-module') === module ? 'Editing' : 'Configure'; });
    renderCartPreview();
  }

  function renderCartPreview() {
    var progressEnabled = one('[data-module-switch="progress"]').classList.contains('on');
    var offerEnabled = one('[data-module-switch="offer"]').classList.contains('on');
    var summaryEnabled = one('[data-module-switch="summary"]').classList.contains('on');
    var valid = state.cartState === 'valid' || state.cartSubtotal >= 50;
    var remaining = Math.max(0, 50 - state.cartSubtotal);
    var offer = selectedOffer();
    var offerMessage = one('#offer-preview-message');
    if (!offerMessage) {
      offerMessage = document.createElement('span');
      offerMessage.id = 'offer-preview-message';
      offerMessage.className = 'offer-message';
      one('#offer-product-price').insertAdjacentElement('afterend', offerMessage);
    }
    cartConfig[state.cartModule].style = one('#cart-style').value;
    cartConfig[state.cartModule].alignment = one('#cart-alignment').value;
    cartConfig[state.cartModule].message = one('#cart-message').value;
    var message = one('#cart-message').value
      .replace(/{{remaining}}/g, '$' + remaining.toFixed(2))
      .replace(/{{product}}/g, offer.name)
      .replace(/{{status}}/g, valid ? 'All purchase rules are satisfied' : '1 action needed');
    var alert = one('#cart-preview-alert');
    alert.classList.toggle('hide', !progressEnabled);
    [alert, one('#cart-offer-preview'), one('#cart-summary-preview')].forEach(function (element) { element.classList.remove('bar', 'compact', 'banner', 'contained', 'left'); });
    var activePreview = state.cartModule === 'offer' ? one('#cart-offer-preview') : state.cartModule === 'summary' ? one('#cart-summary-preview') : alert;
    activePreview.classList.add(one('#cart-style').value);
    if (one('#cart-alignment').value !== 'full') activePreview.classList.add(one('#cart-alignment').value);
    setText('#cart-progress-message', state.cartModule === 'progress' ? message : (valid ? 'Your cart is ready' : "You're $" + remaining.toFixed(2) + ' away from checkout'));
    setText('#cart-progress-note', valid ? 'All active purchase rules are satisfied.' : 'Add another item or increase quantity.');
    one('#cart-progress-fill').style.width = Math.min(100, (state.cartSubtotal / 50) * 100) + '%';
    one('#cart-offer-preview').classList.toggle('hide', !offerEnabled || state.offerAdded);
    setText('#offer-product-name', offer.name);
    setText('#offer-product-price', '$' + offer.price.toFixed(2));
    setText('#offer-preview-message', state.cartModule === 'offer' ? message : cartConfig.offer.message.replace(/{{product}}/g, offer.name));
    one('#cart-summary-preview').classList.toggle('hide', !summaryEnabled);
    setText('#summary-status', state.cartModule === 'summary' ? message : (valid ? 'Ready for checkout' : '1 action needed'));
    one('#summary-status').style.color = valid ? 'var(--success)' : 'var(--danger)';
    setText('#cart-subtotal', '$' + state.cartSubtotal.toFixed(2));
    setText('#cart-count', 'Cart · ' + state.cartQuantity);
    setText('#preview-quantity', String(state.cartQuantity));
    one('#preview-checkout').textContent = valid ? 'Continue to checkout' : 'Checkout unavailable';
    one('#preview-checkout').style.opacity = valid ? '1' : '.48';
    one('#cart-preview-alert').style.background = valid ? 'var(--success-bg)' : '';
    one('#cart-preview-alert').style.borderColor = valid ? '#a6e1c7' : '';
    one('#cart-preview-alert').style.color = valid ? 'var(--success)' : '';
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('.custom-select')) return;
    if (!event.target.closest('.settings-mobile-nav')) closeSettingsMobileMenu();
    var pageButton = event.target.closest('[data-page]');
    if (pageButton) {
      var page = pageButton.getAttribute('data-page');
      if (pageButton.getAttribute('data-settings')) showSettingsTab(pageButton.getAttribute('data-settings'));
      else if (pageButton.getAttribute('data-rules-tab')) showRulesTab(pageButton.getAttribute('data-rules-tab'));
      else navigate(page);
      return;
    }

    var tabButton = event.target.closest('[data-rules-tab]');
    if (tabButton) { showRulesTab(tabButton.getAttribute('data-rules-tab')); return; }

    var configButton = event.target.closest('[data-config]');
    if (configButton) {
      var configRow = configButton.closest('[data-rule-id]');
      openConfig(configButton.getAttribute('data-config'), configRow ? configRow.getAttribute('data-rule-id') : null);
      return;
    }

    var settingsButton = event.target.closest('[data-settings-tab]');
    if (settingsButton) { showSettingsTab(settingsButton.getAttribute('data-settings-tab')); return; }

    var moduleSwitch = event.target.closest('[data-module-switch]');
    if (moduleSwitch) {
      moduleSwitch.classList.toggle('on');
      moduleSwitch.setAttribute('aria-pressed', moduleSwitch.classList.contains('on') ? 'true' : 'false');
      renderCartPreview();
      toast(moduleSwitch.classList.contains('on') ? 'Module enabled in the preview.' : 'Module hidden from the preview.');
      return;
    }

    var switchButton = event.target.closest('.switch');
    if (switchButton) {
      switchButton.classList.toggle('on');
      switchButton.setAttribute('aria-pressed', switchButton.classList.contains('on') ? 'true' : 'false');
      var target = switchButton.getAttribute('data-switch');
      if (target === 'minimum') one('#minimum-field').classList.toggle('hide', !switchButton.classList.contains('on'));
      if (target === 'maximum') one('#maximum-field').classList.toggle('hide', !switchButton.classList.contains('on'));
      if (switchButton.id === 'theme-colour-switch') one('#cart-storefront').classList.toggle('theme-custom', !switchButton.classList.contains('on'));
      return;
    }

    var previewButton = event.target.closest('[data-preview]');
    if (previewButton) {
      all('[data-preview]').forEach(function (button) { button.classList.toggle('active', button === previewButton); });
      one('#storefront-preview').classList.toggle('mobile', previewButton.getAttribute('data-preview') === 'mobile');
      return;
    }

    var cartState = event.target.closest('[data-cart-state]');
    if (cartState) {
      all('[data-cart-state]').forEach(function (button) { button.classList.toggle('active', button === cartState); });
      state.cartState = cartState.getAttribute('data-cart-state');
      state.cartSubtotal = state.cartState === 'valid' ? 58 : 29;
      state.cartQuantity = state.cartState === 'valid' ? 3 : 2;
      state.offerAdded = false;
      renderCartPreview();
      return;
    }

    var moduleButton = event.target.closest('[data-cart-module]');
    if (moduleButton) {
      selectCartModule(moduleButton.getAttribute('data-cart-module'));
      var editor = one('#cart-configurator');
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      one('#module-config-title').focus({ preventScroll: true });
      one('.configuration-shell').classList.add('attention');
      window.setTimeout(function () { one('.configuration-shell').classList.remove('attention'); }, 850);
      return;
    }

    var newCategory = event.target.closest('[data-new-rule-category]');
    if (newCategory) { openConfig(newCategory.getAttribute('data-new-rule-category'), state.pendingRuleId); return; }

    var rowAction = event.target.closest('[data-rule-action]');
    if (rowAction) { applyRuleAction(rowAction.closest('tr'), rowAction.getAttribute('data-rule-action')); return; }

    var bulkAction = event.target.closest('[data-bulk-rule-action]');
    if (bulkAction) {
      var actionName = bulkAction.getAttribute('data-bulk-rule-action');
      var selectedBoxes = all('.rule-select:checked');
      selectedBoxes.forEach(function (box) { applyRuleAction(box.closest('tr'), actionName, true); });
      updateRuleSelection();
      toast(selectedBoxes.length + ' rules ' + (actionName === 'archive' ? 'archived.' : actionName === 'pause' ? 'paused.' : 'published.'));
      return;
    }

    var cartDevice = event.target.closest('[data-cart-device]');
    if (cartDevice) {
      all('[data-cart-device]').forEach(function (button) { button.classList.toggle('active', button === cartDevice); });
      one('#cart-storefront').classList.toggle('mobile', cartDevice.getAttribute('data-cart-device') === 'mobile');
      return;
    }

    var publishOutcome = event.target.closest('[data-publish-outcome]');
    if (publishOutcome) {
      state.publishOutcome = publishOutcome.getAttribute('data-publish-outcome');
      all('[data-publish-outcome]').forEach(function (button) { button.classList.toggle('active', button === publishOutcome); });
      toast('Prototype outcome set to: ' + publishOutcome.textContent + '.');
      return;
    }

    var merchantButton = event.target.closest('[data-open-merchant]');
    if (merchantButton) {
      setText('#merchant360-name', merchantButton.getAttribute('data-open-merchant'));
      navigate('merchant360');
      return;
    }

    var caseButton = event.target.closest('[data-case]');
    if (caseButton) {
      all('[data-case]').forEach(function (button) { button.classList.toggle('active', button === caseButton); });
      toast('Case #' + caseButton.getAttribute('data-case') + ' loaded with its current snapshot and timeline.');
      return;
    }

    if (event.target.closest('#qty-plus')) {
      state.cartQuantity += 1; state.cartSubtotal += 14.5; renderCartPreview(); return;
    }
    if (event.target.closest('#qty-minus')) {
      if (state.cartQuantity > 1) { state.cartQuantity -= 1; state.cartSubtotal = Math.max(0, state.cartSubtotal - 14.5); }
      renderCartPreview(); return;
    }
    if (event.target.closest('#add-offer')) {
      var offer = selectedOffer(); state.cartSubtotal += offer.price; state.cartQuantity += 1; state.offerAdded = true; renderCartPreview(); toast(offer.name + ' added to the sample cart.'); return;
    }

    if (event.target.closest('.shopify-links button')) { toast('This link belongs to Shopify Admin and sits outside the KartVantage demo.'); return; }

    if (event.target.closest('.store-pill')) { toast('Store selector opened for Northstar Goods.'); return; }
    if (event.target.closest('#notifications-button')) { toast('You have no new KartVantage notifications.'); return; }

    var insightRange = event.target.closest('[data-page-panel="insights"] .header-actions .btn');
    if (insightRange) {
      insightRange.textContent = insightRange.textContent.indexOf('30') !== -1 ? 'Last 7 days ⌄' : insightRange.textContent.indexOf('7') !== -1 ? 'Last 90 days ⌄' : 'Last 30 days ⌄';
      toast('Insight range updated using sample data.'); return;
    }

    var action = event.target.closest('[data-action]');
    if (!action) return;
    var name = action.getAttribute('data-action');
    if (name === 'toggle-settings-menu') toggleSettingsMobileMenu();
    else if (name === 'new-rule') openNewRuleChooser();
    else if (name === 'close-new-rule') cancelNewRuleChooser();
    else if (name === 'support' || name === 'contact-support') showSettingsTab('support');
    else if (name === 'save-draft') toast('Draft saved. Nothing has been published.');
    else if (name === 'publish') openPublishReview();
    else if (name === 'close-publish') closePublishReview();
    else if (name === 'confirm-publish') {
      one('#publish-state').classList.remove('hide');
      setText('#publish-state-title', 'Write pending');
      setText('#publish-state-copy', 'Publication intent is recorded. Waiting for Shopify confirmation…');
      one('#publish-state-orb').className = 'status-orb';
      window.setTimeout(function () { renderPublishOutcome(state.publishOutcome); }, 650);
    }
    else if (name === 'save-cart') toast('Cart drawer settings saved as a draft.');
    else if (name === 'save-settings') toast('Settings saved.');
    else if (name === 'waitlist') toast('Interest recorded for this prototype.');
    else if (name === 'enable-embed') toast('Prototype: this would open the Shopify theme editor.');
    else if (name === 'add-product') toast('Product picker opened.');
    else if (name === 'copy-support-id') toast('Support ID copied: KV-NSG-82Q4');
    else if (name === 'export-data') toast('Privacy-safe diagnostic export prepared.');
    else if (name === 'privacy-request') toast('Deletion request flow opened.');
    else if (name === 'refresh-health') toast('Status refreshed just now.');
    else if (name === 'diagnostics') toast('Diagnostics panel opened for this prototype.');
    else if (name === 'refresh-control') toast('Operational snapshot refreshed just now.');
    else if (name === 'view-job') toast('Job detail opened with attempt history and reconciliation state.');
    else if (name === 'view-webhooks') toast('Webhook inbox opened with HMAC, deduplication, and delivery evidence.');
    else if (name === 'view-jobs') toast('Durable job queue opened with leases, retries, and dead-letter state.');
    else if (name === 'view-billing') toast('Billing audit opened. Shopify subscription state remains authoritative.');
    else if (name === 'view-sync') toast('Shop reconciliation opened with cursors, drift, and latest repair evidence.');
    else if (name === 'resolve-case') toast('Case moved to verification. A resolution is not complete until the merchant-visible result is confirmed.');
    else if (name === 'add-note') toast('Private internal note added to the case timeline.');
    else if (name === 'open-runbook') toast('Runbook opened in read-only mode.');
    else if (name === 'new-case') toast('New case intake opened.');
    else if (name === 'new-incident') toast('Incident draft opened.');
    else if (name === 'incident-timeline') toast('Incident timeline expanded.');
    else if (name === 'view-segment') toast('Merchant segment opened with sample health signals.');
    else if (name === 'export-success') toast('Privacy-safe customer-success view prepared.');
  });

  one('#menu-toggle').addEventListener('click', function () {
    if (window.innerWidth > 980) return;
    setSidebar(one('#app').classList.contains('sidebar-collapsed'));
  });
  one('#mobile-overlay').addEventListener('click', closeMobileNav);
  window.addEventListener('resize', function () {
    var compact = window.innerWidth <= 980;
    if (compact === sidebarCompact) return;
    sidebarCompact = compact;
    setSidebar(!compact);
  });
  one('#role-switch').addEventListener('change', function (event) { setRole(event.target.value, false); });
  function routeFromLocation() {
    var value = window.location.hash.replace('#', '') || 'overview';
    var newRuleMatch = value.match(/^rules\/([A-Za-z0-9_-]+)\/new$/);
    if (newRuleMatch) return { page: 'new-rule', ruleId: newRuleMatch[1] };
    var editRuleMatch = value.match(/^rules\/([A-Za-z0-9_-]+)\/edit$/);
    if (editRuleMatch) return { page: 'config', ruleId: editRuleMatch[1] };
    return { page: value };
  }

  function syncRouteFromLocation() {
    var route = routeFromLocation();
    if (route.page === 'new-rule') {
      if (state.page !== 'rules') navigate('rules', true);
      if (state.pendingRuleId !== route.ruleId || one('#new-rule-modal').classList.contains('hide')) openNewRuleChooser(route.ruleId, true);
      return;
    }
    if (route.page === 'config') {
      var configType = ruleTypeForId(route.ruleId);
      if (configType) openConfig(configType, route.ruleId, true);
      else { navigate('rules', true); window.location.hash = 'rules'; toast('That rule is not available in this prototype session.'); }
      return;
    }
    closeNewRuleChooser();
    state.pendingRuleId = null;
    var allowed = [].concat(rolePages.merchant, rolePages.operations, rolePages.support);
    if (allowed.indexOf(route.page) !== -1 && route.page !== state.page) navigate(route.page, true);
  }
  window.addEventListener('hashchange', syncRouteFromLocation);
  window.addEventListener('popstate', syncRouteFromLocation);
  window.addEventListener('pageshow', syncRouteFromLocation);

  one('#rule-search').addEventListener('input', filterRules);
  one('#rule-status-filter').addEventListener('change', filterRules);
  one('#rule-sort').addEventListener('change', function (event) {
    var rows = all('#rules-table tr');
    var value = event.target.value;
    rows.sort(function (a, b) {
      if (value === 'name') return a.getAttribute('data-rule-row').localeCompare(b.getAttribute('data-rule-row'));
      var direction = value === 'oldest' ? 1 : -1;
      return (Number(a.getAttribute('data-updated')) - Number(b.getAttribute('data-updated'))) * direction;
    }).forEach(function (row) { one('#rules-table').appendChild(row); });
  });
  one('#select-all-rules').addEventListener('change', function (event) {
    state.allRulesSelected = false;
    visibleRuleRows().forEach(function (row) { row.querySelector('.rule-select').checked = event.target.checked; });
    updateRuleSelection();
  });
  one('#select-page-rules').addEventListener('change', function (event) {
    state.allRulesSelected = false;
    visibleRuleRows().forEach(function (row) { row.querySelector('.rule-select').checked = event.target.checked; });
    updateRuleSelection();
  });
  one('#select-all-store-rules').addEventListener('click', function () {
    state.allRulesSelected = true;
    all('.rule-select').forEach(function (box) { if (!box.closest('tr').classList.contains('archived')) box.checked = true; });
    updateRuleSelection();
  });
  one('#clear-rule-selection').addEventListener('click', function () {
    state.allRulesSelected = false;
    all('.rule-select').forEach(function (box) { box.checked = false; });
    updateRuleSelection();
  });
  all('.rule-select').forEach(function (box) { box.addEventListener('change', function () { state.allRulesSelected = false; updateRuleSelection(); }); });
  one('#merchant-search').addEventListener('input', function (event) {
    var query = event.target.value.toLowerCase().trim();
    all('[data-merchant-row]').forEach(function (row) {
      row.classList.toggle('hide', row.getAttribute('data-merchant-row').indexOf(query) === -1 && row.textContent.toLowerCase().indexOf(query) === -1);
    });
  });

  all('input[name="scope"]').forEach(function (input) {
    input.addEventListener('change', function () {
      all('.choice-row .choice').forEach(function (choice) { choice.classList.toggle('active', !!choice.querySelector('input:checked')); });
    });
  });

  one('#minimum-input').addEventListener('input', function () { updatePreviewFromMinimum(); renderRuleMessage(); });
  one('#maximum-input').addEventListener('input', renderRuleMessage);
  one('#message-input').addEventListener('input', renderRuleMessage);
  ['#cart-style', '#cart-alignment', '#offer-product'].forEach(function (selector) {
    one(selector).addEventListener('change', renderCartPreview);
  });
  one('#cart-message').addEventListener('input', renderCartPreview);
  one('#run-test').addEventListener('click', function () {
    var subtotal = Number(one('#test-subtotal').value || 0);
    var allowed = subtotal >= 50;
    var result = one('#test-result');
    result.querySelector('.result-x').textContent = allowed ? '✓' : '×';
    result.querySelector('.result-x').style.color = allowed ? 'var(--success)' : '';
    result.querySelector('.result-x').style.background = allowed ? 'var(--success-bg)' : '';
    result.querySelector('.badge').textContent = allowed ? 'Allowed' : 'Blocked';
    result.querySelector('.badge').className = allowed ? 'badge published' : 'badge warning';
    result.querySelector('.card-title').textContent = allowed ? 'Cart meets this rule' : 'Cart does not meet this rule';
    result.querySelector('.sf-alert').innerHTML = allowed ? '<strong>Ready for checkout</strong>The order minimum has been satisfied.' : '<strong>Add $' + Math.max(0, 50 - subtotal).toFixed(2) + ' more to continue</strong>Your order must reach $50.00 before checkout.';
    setText('#trace-subtotal', '$' + subtotal.toFixed(2));
    var rows = result.querySelectorAll('.trace-row strong');
    rows[rows.length - 1].textContent = allowed ? 'Allowed' : 'Blocked';
    rows[rows.length - 1].style.color = allowed ? 'var(--success)' : 'var(--danger)';
    toast('Rule test completed.');
  });

  enhanceSelects();
  setSidebar(!sidebarCompact);
  all('.switch').forEach(function (button) { button.setAttribute('aria-pressed', button.classList.contains('on') ? 'true' : 'false'); });
  one('#publish-modal').addEventListener('click', function (event) { if (event.target === one('#publish-modal')) closePublishReview(); });
  one('#new-rule-modal').addEventListener('click', function (event) { if (event.target === one('#new-rule-modal')) cancelNewRuleChooser(); });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeSettingsMobileMenu();
    if (!one('#publish-modal').classList.contains('hide')) closePublishReview();
    if (!one('#new-rule-modal').classList.contains('hide')) cancelNewRuleChooser();
  });
  syncRouteFromLocation();
  var offerMessage = document.createElement('span');
  offerMessage.id = 'offer-preview-message';
  offerMessage.textContent = 'Add this item and get closer to checkout';
  one('#offer-product-price').parentNode.insertBefore(offerMessage, one('#offer-product-price'));
  selectCartModule('progress');
})();
