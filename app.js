(function () {
  'use strict';

  var state = { page: 'overview', role: 'merchant', rulesTab: 'library', settingsTab: 'general', configType: 'order', ruleId: null, pendingRuleId: null, rulePreviewState: 'minimum', rulePreviewQuantity: 2, ruleResourceIds: [], cartModule: 'progress', cartWorkspace: 'start', cartFeatureGroup: 'foundation', cartPreset: 'guided', drawerMode: 'theme', previewSurface: 'theme', cartDevice: 'desktop', cartState: 'issue', cartQuantity: 2, cartSubtotal: 50, cartDiscount: 0, offerAdded: false, upsellIndex: 0, upsellSource: 'products', upsellProducts: [{ id: 'p_canvas', name: 'Canvas tote', price: 24 }, { id: 'p_mug', name: 'Travel mug', price: 18 }, { id: 'p_wrap', name: 'Gift wrap', price: 6 }], resourcePickerContext: 'upsell', resourcePickerType: 'products', resourcePickerSelection: [], publishOutcome: 'confirmed', allRulesSelected: false };
  var resourceProducts = [
    { id: 'p_canvas', name: 'Canvas tote', price: 24, detail: 'Accessories · 18 available' },
    { id: 'p_mug', name: 'Travel mug', price: 18, detail: 'Drinkware · 32 available' },
    { id: 'p_wrap', name: 'Gift wrap', price: 6, detail: 'Services · Available' },
    { id: 'p_cap', name: 'Summer cap', price: 22, detail: 'Apparel · 14 available' },
    { id: 'p_towel', name: 'Beach towel', price: 28, detail: 'Home · 11 available' },
    { id: 'p_bottle', name: 'Water bottle', price: 16, detail: 'Drinkware · 27 available' }
  ];
  var resourceCollections = [
    { id: 'c_summer', name: 'Summer essentials', count: 7, products: ['p_cap', 'p_towel', 'p_bottle', 'p_canvas'] },
    { id: 'c_best', name: 'Best sellers', count: 12, products: ['p_mug', 'p_canvas', 'p_bottle', 'p_wrap'] },
    { id: 'c_gifts', name: 'Gift ideas', count: 6, products: ['p_wrap', 'p_mug', 'p_canvas', 'p_towel'] }
  ];
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
      unit: '$', min: '50', max: '500', currency: 'USD',
      minHelp: 'Require the eligible cart value to reach this amount.',
      maxHelp: 'Prevent the eligible cart value from exceeding this amount.',
      previewTitle: 'Add $21.00 more to continue',
      previewBody: 'Your order must reach $50.00 before checkout.',
      minimumMessage: 'Add {{remaining}} more to continue. Minimum is {{minimum}}.',
      maximumMessage: 'Reduce your cart. Maximum is {{maximum}}.'
    },
    product: {
      title: 'Product quantity limits',
      subtitle: 'Control the minimum and maximum quantity allowed per product.',
      name: 'Holiday product limit',
      unit: 'Qty', min: '1', max: '4',
      minHelp: 'Require at least this quantity for each eligible product.',
      maxHelp: 'Prevent each eligible product from exceeding this quantity.',
      previewTitle: 'Reduce this item to 4',
      previewBody: 'You can purchase up to 4 of this product.',
      minimumMessage: 'You must purchase at least {{minimum}} of {{product}}.',
      maximumMessage: 'You can purchase a maximum of {{maximum}} of {{product}}.'
    },
    cart: {
      title: 'Total cart item limits',
      subtitle: 'Control the minimum and maximum number of items in the cart.',
      name: 'Cart item range',
      unit: 'Items', min: '2', max: '20',
      minHelp: 'Require the cart to contain at least this many items.',
      maxHelp: 'Prevent the cart from containing more than this many items.',
      previewTitle: 'Add 1 more item to continue',
      previewBody: 'Your cart must contain at least 2 items before checkout.',
      minimumMessage: 'Add {{remaining}} item(s). Minimum is {{minimum}}.',
      maximumMessage: 'Remove items. Maximum is {{maximum}}; your cart has {{current}}.'
    }
  };
  var cartConfig = {
    header: { title: 'Cart header', description: 'Configure the drawer title, item count, close icon and divider.', message: 'Your cart', help: 'Use a concise title or optional custom header text.' },
    items: { title: 'Cart items', description: 'Control product image, title, variants, prices, discounts and properties.', message: 'Cart items', help: 'Cart items remain connected to Shopify cart data.' },
    quantity: { title: 'Quantity selector', description: 'Set selector style, step, minimum, maximum and validation copy.', message: 'Choose a quantity', help: 'Quantity controls respect active purchase rules.' },
    remove: { title: 'Remove item', description: 'Choose link or icon treatment and optional confirmation copy.', message: 'Remove item?', help: 'Confirmation is optional and must not block keyboard use.' },
    progress: { title: 'Free shipping progress', description: 'Display progress toward a free-shipping goal.', message: "You're {{remaining}} away from free shipping", help: 'Use {{remaining}} to show the amount still needed.' },
    offer: { title: 'Cart upsell', description: 'Recommend selected products or collections using cart context.', message: '{{product}} pairs well with your cart', help: 'Use {{product}} for the selected recommendation.' },
    summary: { title: 'Order & savings summary', description: 'Show subtotal, discounts, savings and estimated total.', message: 'You are saving {{savings}} today', help: 'Use {{savings}} for total savings.' },
    discount: { title: 'Discount code', description: 'Let shoppers apply or remove a discount code.', message: 'Add a discount code', help: 'Shopify validates discount availability.' },
    gift: { title: 'Free gift', description: 'Unlock a gift when configured cart conditions are met.', message: 'You unlocked a free gift!', help: 'Preview locked and unlocked states.' },
    rewards: { title: 'Rewards & milestones', description: 'Configure ordered cart-value milestones.', message: 'Next reward at {{goal}}', help: 'Use goal and remaining variables.' },
    addons: { title: 'Cart add-ons', description: 'Offer optional products or services such as gift wrap.', message: 'Add gift wrapping', help: 'Configure add-on product and selection style.' },
    recommendations: { title: 'Product recommendations', description: 'Show manual or automated product suggestions.', message: 'You may also like', help: 'Select products, collections or an automated source.' },
    trust: { title: 'Trust message & payment icons', description: 'Reassure shoppers near checkout.', message: 'Secure checkout · Fast shipping · 30-day returns', help: 'Keep trust claims accurate and store-specific.' },
    content: { title: 'Custom content', description: 'Add store-specific text, image, link or button.', message: 'Orders ship within two business days', help: 'Use concise, accurate storefront content.' },
    checkout: { title: 'Checkout button', description: 'Configure text, style, full width, total and disabled state.', message: 'Checkout', help: 'Checkout availability continues to follow authoritative validation.' },
    continue: { title: 'Continue shopping', description: 'Choose link style and destination.', message: 'Continue shopping', help: 'Destination can be previous page, home, collection or a custom URL.' }
  };
  var featureGroups = {
    foundation: { title: 'Cart foundation', copy: 'Configure the essential structure and controls shoppers use in every cart.' },
    motivate: { title: 'Motivate purchase', copy: 'Guide shoppers with progress and clear purchase-rule feedback.' },
    grow: { title: 'Grow the order', copy: 'Add focused merchandising without turning the cart into a catalogue.' },
    checkout: { title: 'Checkout confidence', copy: 'Make savings, trust and the path to checkout clear.' }
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
    all('select:not(.visually-hidden)').forEach(enhanceSelect);
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
    if (page === 'cart') window.setTimeout(renderCartPreview, 0);
    if (page === 'config') window.setTimeout(renderRulePreview, 0);
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

  function closeCartMobileMenu() {
    var menu = one('#cart-mobile-menu');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');
    one('#cart-mobile-trigger').setAttribute('aria-expanded', 'false');
  }

  function toggleCartMobileMenu() {
    var menu = one('#cart-mobile-menu');
    var open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) menu.removeAttribute('inert');
    else menu.setAttribute('inert', '');
    one('#cart-mobile-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
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
    one('button[data-switch="minimum"]').classList.add('on');
    one('button[data-switch="minimum"]').setAttribute('aria-pressed', 'true');
    one('#minimum-field').classList.remove('hide');
    one('button[data-switch="maximum"]').classList.remove('on');
    one('button[data-switch="maximum"]').setAttribute('aria-pressed', 'false');
    one('#maximum-field').classList.add('hide');
    setText('#minimum-help', data.minHelp);
    setText('#maximum-help', data.maxHelp);
    one('#minimum-message').value = data.minimumMessage;
    one('#maximum-message').value = data.maximumMessage;
    one('#message-input').value = data.minimumMessage;
    one('#product-behavior').classList.toggle('hide', type !== 'product');
    one('#cart-behavior').classList.toggle('hide', type !== 'cart');
    one('#rule-cart-lines').classList.toggle('hide', type !== 'cart');
    one('.rule-preview-product').classList.toggle('hide', type === 'cart');
    setText('#message-variable-help', type === 'cart' ? 'Supported variables: {{minimum}}, {{maximum}}, {{current}}, {{remaining}}.' : type === 'product' ? 'Supported variables: {{minimum}}, {{maximum}}, {{remaining}}, {{product}}.' : 'Supported variables: {{minimum}}, {{maximum}}, {{remaining}}.');
    state.rulePreviewState = 'minimum';
    all('[data-rule-preview-state]').forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-rule-preview-state') === 'minimum'); });
    one('#rule-status').value = 'draft';
    syncCustomSelect(one('#rule-status'));
    renderRulePreview();
    navigate('config', true);
    if (!fromRoute) window.location.hash = 'rules/' + state.ruleId + '/edit';
  }

  function formatRuleValue(value, type) { return type === 'order' ? '$' + Number(value).toFixed(2) : String(value); }

  function renderRuleTemplate(template, values) {
    return template.replace(/{{minimum}}/g, values.minimum).replace(/{{maximum}}/g, values.maximum).replace(/{{current}}/g, values.current).replace(/{{remaining}}/g, values.remaining).replace(/{{product}}/g, 'Classic cotton tee').replace(/{{itemCount}}/g, values.current);
  }

  function renderRulePreview() {
    var type = state.configType;
    var minimum = Math.max(0, Number(one('#minimum-input').value || config[type].min));
    var maximum = Math.max(minimum, Number(one('#maximum-input').value || config[type].max));
    var previewState = state.rulePreviewState;
    var current;
    if (previewState === 'minimum') current = type === 'order' ? Math.max(0, minimum - 21) : Math.max(0, minimum - 1);
    else if (previewState === 'maximum') current = maximum + (type === 'order' ? 25 : type === 'cart' ? 5 : 1);
    else current = minimum + (type === 'order' ? 15 : 0);
    var remaining = previewState === 'maximum' ? Math.max(0, current - maximum) : Math.max(0, minimum - current);
    var values = {
      minimum: formatRuleValue(minimum, type),
      maximum: formatRuleValue(maximum, type),
      current: formatRuleValue(current, type),
      remaining: formatRuleValue(remaining, type)
    };
    var template = previewState === 'maximum' ? one('#maximum-message').value : previewState === 'satisfied' ? 'This cart satisfies the rule.' : one('#minimum-message').value;
    var text = renderRuleTemplate(template, values);
    var parts = text.split(/(?<=[.!?])\s+/);
    setText('#preview-message-title', parts.shift() || text);
    setText('#preview-message-body', parts.join(' ') || (previewState === 'satisfied' ? 'Checkout is available.' : 'Update the cart to continue.'));
    var alert = one('#rule-preview-alert');
    alert.classList.toggle('success-state', previewState === 'satisfied');
    alert.classList.toggle('error-state', previewState === 'maximum');
    var progressBase = previewState === 'maximum' ? maximum : minimum;
    one('#rule-progress-fill').style.width = Math.min(100, (current / Math.max(1, progressBase)) * 100) + '%';
    if (type === 'order') {
      setText('#rule-progress-note', formatRuleValue(current, type) + ' cart subtotal · allowed ' + values.minimum + '–' + values.maximum);
      setText('#rule-total-label', 'Cart subtotal');
      setText('#rule-total-value', formatRuleValue(current, type) + ' USD');
      setText('#rule-cart-count', 'Cart · 2');
    } else if (type === 'product') {
      state.rulePreviewQuantity = current;
      setText('#rule-preview-quantity', String(current));
      setText('#rule-progress-note', 'Current quantity ' + current + ' · allowed ' + minimum + '–' + maximum);
      setText('#rule-total-label', 'Product quantity');
      setText('#rule-total-value', String(current));
      setText('#rule-cart-count', 'Cart · ' + current);
    } else {
      setText('#rule-progress-note', 'Total items ' + current + ' · allowed ' + minimum + '–' + maximum);
      setText('#rule-total-label', 'Total cart items');
      setText('#rule-total-value', String(current));
      setText('#rule-cart-count', 'Cart · ' + current);
      var lines = one('#rule-cart-lines').querySelectorAll('span');
      if (lines[0]) lines[0].textContent = 'Classic cotton tee × ' + Math.max(1, Math.ceil(current * .6));
      if (lines[1]) lines[1].textContent = 'Canvas tote × ' + Math.max(0, Math.floor(current * .4));
    }
    setText('#rule-preview-cta', previewState === 'satisfied' ? 'Checkout' : previewState === 'maximum' ? 'Update cart' : 'Checkout unavailable');
    one('#rule-preview-cta').disabled = previewState !== 'satisfied';
  }

  function updatePreviewFromMinimum() { renderRulePreview(); }

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
    if (!state.upsellProducts.length) return { id: 'fallback', name: 'Canvas tote', price: 24 };
    state.upsellIndex = Math.max(0, Math.min(state.upsellIndex, state.upsellProducts.length - 1));
    return state.upsellProducts[state.upsellIndex];
  }

  function updateUpsellSelectionSummary() {
    var container = one('#upsell-selected-resources');
    if (!container) return;
    container.innerHTML = state.upsellProducts.map(function (product) { return '<span class="selected-chip">' + product.name + '</span>'; }).join('');
    var picker = one('[data-open-resource-picker="upsell"]');
    if (picker) picker.textContent = state.upsellSource === 'collection' ? 'Select a collection from Shopify' : 'Select products from Shopify';
  }

  function renderResourcePicker() {
    var isCollection = state.resourcePickerType === 'collection';
    var isRulePicker = state.resourcePickerContext === 'rule';
    var term = one('#resource-picker-search').value.trim().toLowerCase();
    var resources = (isCollection ? resourceCollections : resourceProducts).filter(function (resource) { return resource.name.toLowerCase().indexOf(term) !== -1; });
    setText('#resource-picker-title', isCollection ? (isRulePicker ? 'Select collections' : 'Select a collection') : 'Select products');
    one('#resource-picker-search').placeholder = isCollection ? 'Search collections' : 'Search products';
    one('#resource-picker-filter').closest('.custom-select').classList.toggle('hide', isCollection);
    one('#resource-picker-list').innerHTML = resources.map(function (resource) {
      var checked = state.resourcePickerSelection.indexOf(resource.id) !== -1;
      var meta = isCollection ? resource.count + ' products' : resource.detail + ' · $' + resource.price.toFixed(2);
      var full = !isRulePicker && !isCollection && state.resourcePickerSelection.length >= 4 && !checked;
      var inputType = isCollection && !isRulePicker ? 'radio' : 'checkbox';
      return '<label class="resource-picker-row' + (full ? ' disabled' : '') + '"><input type="' + inputType + '" name="resource-picker-item" value="' + resource.id + '" ' + (checked ? 'checked' : '') + (full ? ' disabled' : '') + '><span class="resource-thumb">▧</span><span><strong>' + resource.name + '</strong><small>' + meta + '</small></span></label>';
    }).join('') || '<div class="resource-picker-empty">No matching Shopify resources.</div>';
    var count = state.resourcePickerSelection.length;
    setText('#resource-picker-count', isRulePicker ? count + ' ' + (isCollection ? (count === 1 ? 'collection selected' : 'collections selected') : (count === 1 ? 'product selected' : 'products selected')) : isCollection ? count + ' ' + (count === 1 ? 'collection selected' : 'collections selected') : count + ' of 4 products selected');
    one('[data-action="confirm-resource-picker"]').disabled = count === 0;
  }

  function openResourcePicker(context) {
    state.resourcePickerContext = context || 'upsell';
    if (state.resourcePickerContext === 'rule') {
      var scope = (one('input[name="scope"]:checked') || {}).value || 'products';
      state.resourcePickerType = scope === 'collections' ? 'collection' : 'products';
      state.resourcePickerSelection = state.ruleResourceIds.slice();
    } else {
      state.resourcePickerType = one('#upsell-source').value;
      state.upsellSource = state.resourcePickerType;
      state.resourcePickerSelection = state.resourcePickerType === 'collection' ? [] : state.upsellProducts.map(function (product) { return product.id; });
    }
    one('#resource-picker-search').value = '';
    renderResourcePicker();
    showModal('#resource-picker-modal', '#resource-picker-search');
  }

  function confirmResourcePicker() {
    if (state.resourcePickerContext === 'rule') {
      state.ruleResourceIds = state.resourcePickerSelection.slice();
      var source = state.resourcePickerType === 'collection' ? resourceCollections : resourceProducts;
      var selected = state.ruleResourceIds.map(function (id) { return source.find(function (item) { return item.id === id; }); }).filter(Boolean);
      one('#rule-selected-resources').innerHTML = selected.map(function (item) { return '<span class="selected-chip">' + item.name + '<button type="button" aria-label="Remove ' + item.name + '">×</button></span>'; }).join('');
      var resourceLabel = state.resourcePickerType === 'collection' ? 'collection' : 'product';
      setText('#resource-selection-copy', selected.length + ' ' + resourceLabel + (selected.length === 1 ? '' : 's') + ' selected');
      setText('#rule-resource-picker-button', 'Change ' + resourceLabel + (resourceLabel === 'product' ? 's' : 's'));
      hideModal('#resource-picker-modal');
      toast('Shopify Resource Picker simulated: ' + selected.length + ' resources selected for the rule.');
      return;
    }
    var limit = Math.max(1, Math.min(4, Number(one('#upsell-limit').value || 4)));
    one('#upsell-limit').value = String(limit);
    if (state.resourcePickerType === 'collection') {
      var collection = resourceCollections.find(function (item) { return item.id === state.resourcePickerSelection[0]; });
      state.upsellProducts = collection ? collection.products.map(function (id) { return resourceProducts.find(function (product) { return product.id === id; }); }).filter(Boolean).slice(0, limit) : [];
      toast(collection ? collection.name + ' selected. Preview limited to ' + state.upsellProducts.length + ' products.' : 'Select a collection.');
    } else {
      state.upsellProducts = state.resourcePickerSelection.map(function (id) { return resourceProducts.find(function (product) { return product.id === id; }); }).filter(Boolean).slice(0, limit);
      toast(state.upsellProducts.length + ' Shopify products selected for the upsell.');
    }
    state.upsellIndex = 0;
    state.offerAdded = false;
    updateUpsellSelectionSummary();
    hideModal('#resource-picker-modal');
    renderCartPreview();
  }

  function renderRuleMessage() {
    if (state.rulePreviewState === 'minimum') one('#minimum-message').value = one('#message-input').value;
    renderRulePreview();
  }

  function selectCartModule(module) {
    state.cartModule = module;
    var data = cartConfig[module] || cartConfig.progress;
    setText('#module-config-title', data.title);
    setText('#module-config-description', data.description);
    one('#cart-message').value = data.message;
    setText('#cart-message-help', data.help);
    one('#widget-heading').value = module === 'offer' || module === 'recommendations' ? 'You may also like' : data.title;
    all('.upsell-only').forEach(function (field) { field.classList.toggle('hide', module !== 'offer'); });
    updateUpsellSelectionSummary();
    var editor = one('#cart-configurator');
    one('#feature-studio-home').classList.add('hide');
    one('#feature-group-view').classList.add('hide');
    editor.classList.remove('inline-widget-editor');
    editor.classList.remove('hide');
    all('[data-widget]').forEach(function (card) { card.classList.toggle('active-module', card.getAttribute('data-widget') === module || (module === 'offer' && card.getAttribute('data-widget') === 'upsell')); });
    renderCartPreview();
  }

  function filterFeatureRows() {
    all('.widget-row[data-feature-group]').forEach(function (row) {
      var wrongGroup = row.getAttribute('data-feature-group') !== state.cartFeatureGroup;
      var unavailable = state.drawerMode === 'theme' && row.classList.contains('kv-only-widget');
      row.classList.toggle('hide', wrongGroup || unavailable);
    });
  }

  function showFeatureJourney() {
    one('#cart-configurator').classList.add('hide');
    one('#feature-group-view').classList.add('hide');
    one('#feature-studio-home').classList.remove('hide');
  }

  function showFeatureGroup(group) {
    state.cartFeatureGroup = featureGroups[group] ? group : 'foundation';
    var data = featureGroups[state.cartFeatureGroup];
    setText('#feature-group-title', data.title);
    setText('#feature-group-copy', data.copy);
    filterFeatureRows();
    var visibleCount = all('.widget-row[data-feature-group="' + state.cartFeatureGroup + '"]:not(.hide)').length;
    setText('#feature-group-count', visibleCount + (visibleCount === 1 ? ' feature' : ' features'));
    one('#feature-studio-home').classList.add('hide');
    one('#cart-configurator').classList.add('hide');
    one('#feature-group-view').classList.remove('hide');
    one('#feature-group-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectCartPreset(preset, button) {
    state.cartPreset = preset;
    var recipe = button && button.closest('[data-drawer-mode-panel]');
    if (recipe) recipe.querySelectorAll('[data-cart-preset]').forEach(function (item) { item.classList.toggle('active', item === button); });
    var labels = {
      guided: ['Recommended enhancements selected', 'Four compatible features · about 3 minutes to review'],
      minimal: ['Minimal theme layer selected', 'Two compatible features · lowest theme impact'],
      conversion: ['Conversion-ready recipe selected', 'Eight focused features · designed for higher cart value'],
      essential: ['Clean essentials selected', 'Required structure and checkout · fastest setup'],
      custom: ['Custom foundation selected', 'Required cart structure only · add features when ready']
    };
    var copy = labels[preset] || labels.guided;
    setText('#studio-recipe-name', copy[0]);
    setText('#studio-recipe-copy', copy[1]);
  }

  function showCartWorkspace(panel) {
    state.cartWorkspace = panel;
    all('[data-cart-workspace]').forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-cart-workspace') === panel); });
    var workspaceNames = { start: 'Start', builder: 'Design', widgets: 'Features', test: 'Test', publish: 'Publish' };
    setText('#cart-mobile-current', workspaceNames[panel] || 'Start');
    closeCartMobileMenu();
    all('[data-cart-workspace-panel]').forEach(function (section) { section.classList.toggle('hide', section.getAttribute('data-cart-workspace-panel') !== panel); });
    if (panel === 'widgets') showFeatureJourney();
    else one('#cart-configurator').classList.add('hide');
    var target = one('[data-cart-workspace-panel="' + panel + '"]');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setCartDevice(device) {
    state.cartDevice = device;
    all('[data-cart-device]').forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-cart-device') === device); });
    one('#cart-storefront').classList.toggle('mobile', device === 'mobile');
    one('#theme-storefront').classList.toggle('mobile', device === 'mobile');
    if (one('#preview-device-select')) one('#preview-device-select').value = device;
  }

  function setPreviewSurface(surface) {
    state.previewSurface = surface;
    all('[data-preview-surface]').forEach(function (button) { var selected = button.getAttribute('data-preview-surface') === surface; button.classList.toggle('active', selected); if (button.getAttribute('role') === 'tab') button.setAttribute('aria-selected', selected ? 'true' : 'false'); });
    one('#theme-preview-pane').classList.toggle('hide', surface === 'kartvantage');
    one('#kv-preview-pane').classList.toggle('hide', surface === 'theme');
    one('#drawer-comparison-stage').classList.toggle('compare', surface === 'compare');
    one('.cart-builder-layout').classList.toggle('compare-active', surface === 'compare');
    setText('#preview-mode-label', surface === 'theme' ? 'Dawn theme snapshot' : surface === 'kartvantage' ? 'KartVantage draft' : 'Synchronized side-by-side comparison');
  }

  function updateDrawerModeUI() {
    all('[data-drawer-mode-panel]').forEach(function (panel) { panel.classList.toggle('hide', panel.getAttribute('data-drawer-mode-panel') !== state.drawerMode); });
    all('.kv-stage').forEach(function (stage) { stage.classList.toggle('hide', state.drawerMode === 'theme'); });
    filterFeatureRows();
    setText('#feature-journey-title', state.drawerMode === 'theme' ? 'Enhance the cart in three moments' : 'Build the cart in four moments');
    setText('#widget-mode-note', state.drawerMode === 'theme' ? 'Choose a moment to configure the four enhancements supported by your theme cart.' : 'Choose a moment instead of scanning a long widget list. The preview stays live while you configure.');
    one('#theme-colour-switch').disabled = state.drawerMode === 'theme';
  }

  function renderCartPreview() {
    var progressEnabled = one('[data-module-switch="progress"]').classList.contains('on');
    var offerEnabled = one('[data-module-switch="offer"]').classList.contains('on');
    var summaryEnabled = one('[data-module-switch="summary"]').classList.contains('on');
    var valid = state.cartState === 'valid' || state.cartSubtotal >= 75;
    var remaining = Math.max(0, 75 - state.cartSubtotal);
    var offer = selectedOffer();
    cartConfig[state.cartModule].message = one('#cart-message').value;
    var message = (state.cartModule === 'progress' ? one('#cart-message').value : cartConfig.progress.message)
      .replace(/{{remaining}}/g, '$' + remaining.toFixed(2))
      .replace(/{{product}}/g, offer.name)
      .replace(/{{status}}/g, valid ? 'All purchase rules are satisfied' : '1 action needed')
      .replace(/{{savings}}/g, '$' + state.cartDiscount.toFixed(2));
    var alert = one('#cart-preview-alert');
    alert.classList.toggle('hide', !progressEnabled);
    setText('#cart-progress-message', valid ? 'Free shipping unlocked' : message);
    setText('#cart-progress-note', valid ? 'Your order qualifies for free shipping.' : 'Add another item or increase quantity.');
    one('#cart-progress-fill').style.width = Math.min(100, (state.cartSubtotal / 75) * 100) + '%';
    one('#cart-offer-preview').classList.toggle('hide', !offerEnabled || state.offerAdded);
    setText('#offer-product-name', offer.name);
    setText('#offer-product-price', '$' + offer.price.toFixed(2));
    setText('#offer-preview-message', cartConfig.offer.message.replace(/{{product}}/g, offer.name));
    var hasCarousel = state.upsellProducts.length > 1;
    one('#upsell-prev').classList.toggle('hide', !hasCarousel);
    one('#upsell-next').classList.toggle('hide', !hasCarousel);
    one('#upsell-dots').classList.toggle('hide', !hasCarousel);
    one('#upsell-dots').innerHTML = state.upsellProducts.map(function (product, index) { return '<button class="upsell-dot' + (index === state.upsellIndex ? ' active' : '') + '" data-upsell-index="' + index + '" aria-label="Show ' + product.name + '"></button>'; }).join('');
    one('#cart-summary-preview').classList.toggle('hide', !summaryEnabled);
    setText('#summary-status', '$' + state.cartDiscount.toFixed(2));
    one('#summary-status').style.color = state.cartDiscount ? 'var(--success)' : 'var(--muted)';
    setText('#cart-subtotal', '$' + Math.max(0, state.cartSubtotal - state.cartDiscount).toFixed(2) + ' USD');
    setText('#cart-count', state.cartQuantity + (state.cartQuantity === 1 ? ' item' : ' items'));
    setText('#preview-quantity', String(state.cartQuantity));
    one('#preview-checkout').textContent = 'Checkout · $' + Math.max(0, state.cartSubtotal - state.cartDiscount).toFixed(2);
    one('#preview-checkout').style.opacity = state.cartQuantity ? '1' : '.48';
    one('#cart-preview-alert').style.background = valid ? 'var(--success-bg)' : '';
    one('#cart-preview-alert').style.borderColor = valid ? '#a6e1c7' : '';
    one('#cart-preview-alert').style.color = valid ? 'var(--success)' : '';
    var discountSwitch = one('[data-preview-widget="discount"]');
    var addonSwitch = one('[data-preview-widget="addons"]');
    var giftSwitch = one('[data-preview-widget="gift"]');
    var trustSwitch = one('[data-preview-widget="trust"]');
    one('#discount-preview').classList.toggle('hide', discountSwitch && !discountSwitch.classList.contains('on'));
    one('#addon-preview').classList.toggle('hide', addonSwitch && !addonSwitch.classList.contains('on'));
    one('#gift-preview').classList.toggle('hide', !((giftSwitch && giftSwitch.classList.contains('on')) && valid));
    one('#trust-preview').classList.toggle('hide', trustSwitch && !trustSwitch.classList.contains('on'));
    [['header', '.drawer-header'], ['items', '.drawer-product'], ['quantity', '.sf-qty'], ['remove', '#remove-preview-item'], ['checkout', '#preview-checkout'], ['continue', '#continue-shopping']].forEach(function (pair) {
      var control = one('[data-preview-widget="' + pair[0] + '"]');
      var target = one(pair[1]);
      if (control && target) target.classList.toggle('hide', !control.classList.contains('on'));
    });
    one('#empty-cart').classList.toggle('hide', state.cartState !== 'empty');
    one('#populated-cart').classList.toggle('hide', state.cartState === 'empty' || state.cartState === 'loading' || state.cartState === 'error');
    one('#drawer-loading').classList.toggle('hide', state.cartState !== 'loading');
    one('#drawer-error').classList.toggle('hide', state.cartState !== 'error');
    setText('#theme-cart-count', String(state.cartQuantity));
    setText('#theme-preview-quantity', String(state.cartQuantity));
    setText('#theme-subtotal', '$' + Math.max(0, state.cartSubtotal - state.cartDiscount).toFixed(2) + ' USD');
    setText('#theme-shipping-message', valid ? 'Free shipping unlocked' : '$' + remaining.toFixed(2) + ' away from free shipping');
    one('#theme-progress-fill').style.width = Math.min(100, (state.cartSubtotal / 75) * 100) + '%';
    setText('#theme-offer-message', cartConfig.offer.message.replace(/{{product}}/g, offer.name));
    one('#theme-progress-widget').classList.toggle('hide', !progressEnabled);
    one('#theme-upsell-widget').classList.toggle('hide', !offerEnabled || state.offerAdded);
    one('#theme-summary-widget').classList.toggle('hide', !summaryEnabled);
    var themeAlertSwitch = one('[data-preview-widget="alerts"]');
    one('#theme-rule-alert').classList.toggle('hide', themeAlertSwitch && !themeAlertSwitch.classList.contains('on'));
    one('#theme-rule-alert').classList.toggle('success', valid);
    one('#theme-rule-alert').querySelector('span').textContent = valid ? 'All active purchase rules are satisfied.' : 'Minimum order value is $50.00.';
    one('#theme-checkout').disabled = !state.cartQuantity;
    one('#theme-checkout').style.opacity = state.cartQuantity ? '1' : '.48';
    var drawer = one('#cart-storefront');
    drawer.classList.add('kv-drawer');
    drawer.style.setProperty('--drawer-bg', one('#drawer-bg').value);
    drawer.style.setProperty('--drawer-header-bg', one('#drawer-header-bg').value);
    drawer.style.setProperty('--drawer-primary', one('#drawer-primary').value);
    drawer.style.setProperty('--drawer-primary-text', one('#drawer-primary-text').value);
    drawer.style.setProperty('--drawer-text', one('#drawer-text').value);
    drawer.style.setProperty('--drawer-accent', one('#drawer-accent').value);
    drawer.style.setProperty('--drawer-width', one('#drawer-width').value + 'px');
    drawer.style.setProperty('--drawer-radius', one('#drawer-radius').value + 'px');
    drawer.style.setProperty('--drawer-padding', one('#drawer-padding').value + 'px');
    drawer.style.setProperty('--drawer-heading-size', one('#drawer-heading-size').value + 'px');
    drawer.style.setProperty('--drawer-body-size', one('#drawer-body-size').value + 'px');
    drawer.style.setProperty('--drawer-button-radius', one('#button-radius').value + 'px');
    drawer.style.fontFamily = one('#drawer-font').value === 'Theme font' ? '' : one('#drawer-font').value;
    drawer.classList.toggle('outline-buttons', one('#cart-style').value === 'Outline');
    one('#preview-checkout').style.fontWeight = one('#drawer-button-weight').value;
    setText('#heading-size-value', one('#drawer-heading-size').value);
    setText('#body-size-value', one('#drawer-body-size').value);
    setText('#drawer-width-value', one('#drawer-width').value);
    setText('#drawer-radius-value', one('#drawer-radius').value);
    setText('#drawer-padding-value', one('#drawer-padding').value);
  }

  function resetDrawerDesign() {
    var defaults = { '#drawer-bg': '#ffffff', '#drawer-header-bg': '#f6f6f7', '#drawer-primary': '#081a33', '#drawer-primary-text': '#ffffff', '#drawer-text': '#202223', '#drawer-accent': '#96c43f', '#drawer-success': '#008060', '#drawer-warning': '#916a00', '#drawer-width': '420', '#drawer-radius': '12', '#drawer-padding': '18', '#drawer-heading-size': '20', '#drawer-body-size': '14' };
    Object.keys(defaults).forEach(function (selector) { one(selector).value = defaults[selector]; });
    one('#theme-colour-switch').classList.add('on');
    one('#theme-colour-switch').setAttribute('aria-pressed', 'true');
    renderCartPreview();
  }

  function resetTestCart() {
    state.cartState = 'issue'; state.cartQuantity = 2; state.cartSubtotal = 50; state.cartDiscount = 0; state.offerAdded = false;
    one('#test-cart-quantity').value = '2'; one('#test-cart-discount').value = ''; one('#preview-discount-input').value = '';
    one('#discount-result').classList.add('hide');
    renderCartPreview();
  }

  function addDisplayCondition() {
    var builder = one('.condition-builder');
    var button = builder.querySelector('[data-action="add-condition"]');
    var row = document.createElement('div');
    row.className = 'condition-row';
    row.innerHTML = '<select aria-label="Condition field"><option>Cart contains product</option><option>Cart contains collection</option><option>Cart contains variant</option><option>Customer tag</option><option>Market</option></select><select aria-label="Condition operator"><option>contains</option><option>does not contain</option><option>equal to</option></select><input aria-label="Condition value" value="Classic cotton tee"><button class="btn mini danger-outline" data-action="remove-condition">Remove</button>';
    builder.insertBefore(row, button);
    row.querySelectorAll('select').forEach(enhanceSelect);
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('.custom-select')) return;
    if (!event.target.closest('.settings-mobile-nav')) closeSettingsMobileMenu();
    if (!event.target.closest('.cart-mobile-nav')) closeCartMobileMenu();
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

    var workspaceButton = event.target.closest('[data-cart-workspace]');
    if (workspaceButton) { showCartWorkspace(workspaceButton.getAttribute('data-cart-workspace')); return; }

    var presetButton = event.target.closest('[data-cart-preset]');
    if (presetButton) { selectCartPreset(presetButton.getAttribute('data-cart-preset'), presetButton); return; }

    var featureStage = event.target.closest('.feature-stage[data-feature-group]');
    if (featureStage) { showCartWorkspace('widgets'); showFeatureGroup(featureStage.getAttribute('data-feature-group')); return; }

    var previewStateButton = event.target.closest('[data-rule-preview-state]');
    if (previewStateButton) {
      state.rulePreviewState = previewStateButton.getAttribute('data-rule-preview-state');
      all('[data-rule-preview-state]').forEach(function (button) { button.classList.toggle('active', button === previewStateButton); });
      renderRulePreview();
      return;
    }

    var resourcePickerButton = event.target.closest('[data-open-resource-picker]');
    if (resourcePickerButton) {
      if (resourcePickerButton.getAttribute('data-open-resource-picker') === 'upsell') {
        openResourcePicker('upsell');
      } else {
        openResourcePicker('rule');
      }
      return;
    }

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
      if (state.page === 'cart') renderCartPreview();
      if (state.page === 'config') renderRulePreview();
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
      showCartWorkspace('widgets');
      selectCartModule(moduleButton.getAttribute('data-cart-module'));
      var editor = one('#cart-configurator');
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      one('#module-config-title').focus({ preventScroll: true });
      editor.classList.add('attention');
      window.setTimeout(function () { editor.classList.remove('attention'); }, 850);
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
      setCartDevice(cartDevice.getAttribute('data-cart-device'));
      return;
    }

    var previewSurface = event.target.closest('[data-preview-surface]');
    if (previewSurface) {
      setPreviewSurface(previewSurface.getAttribute('data-preview-surface'));
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
      state.cartQuantity += 1; state.cartSubtotal += 25; renderCartPreview(); return;
    }
    if (event.target.closest('#qty-minus')) {
      if (state.cartQuantity > 1) { state.cartQuantity -= 1; state.cartSubtotal = Math.max(0, state.cartSubtotal - 25); }
      renderCartPreview(); return;
    }
    if (event.target.closest('#add-offer')) {
      var offer = selectedOffer(); state.cartSubtotal += offer.price; state.cartQuantity += 1; state.offerAdded = true; renderCartPreview(); toast(offer.name + ' added to the sample cart.'); return;
    }
    if (event.target.closest('[data-rule-qty="plus"]')) { state.rulePreviewState = 'satisfied'; state.rulePreviewQuantity += 1; renderRulePreview(); return; }
    if (event.target.closest('[data-rule-qty="minus"]')) { state.rulePreviewState = 'minimum'; state.rulePreviewQuantity = Math.max(0, state.rulePreviewQuantity - 1); renderRulePreview(); return; }
    if (event.target.closest('#remove-preview-item')) { state.cartState = 'empty'; state.cartQuantity = 0; state.cartSubtotal = 0; renderCartPreview(); toast('Sample item removed.'); return; }
    if (event.target.closest('#preview-apply-discount')) {
      var code = one('#preview-discount-input').value.trim();
      if (!code) { toast('Enter a test discount code.'); return; }
      state.cartDiscount = code.toUpperCase() === 'SAVE10' ? 5 : 0;
      one('#discount-result').classList.toggle('hide', !state.cartDiscount);
      setText('#discount-result', state.cartDiscount ? code.toUpperCase() + ' applied · −$5.00' : 'Code is invalid in this test cart');
      renderCartPreview(); return;
    }

    if (event.target.closest('.shopify-links button')) { toast('This link belongs to Shopify Admin and sits outside the KartVantage demo.'); return; }

    if (event.target.closest('.store-pill')) { toast('Store selector opened for Northstar Goods.'); return; }
    if (event.target.closest('#notifications-button')) { toast('You have no new KartVantage notifications.'); return; }

    var upsellDot = event.target.closest('[data-upsell-index]');
    if (upsellDot) { state.upsellIndex = Number(upsellDot.getAttribute('data-upsell-index')); renderCartPreview(); return; }
    if (event.target.closest('#upsell-prev')) { state.upsellIndex = (state.upsellIndex - 1 + state.upsellProducts.length) % state.upsellProducts.length; renderCartPreview(); return; }
    if (event.target.closest('#upsell-next')) { state.upsellIndex = (state.upsellIndex + 1) % state.upsellProducts.length; renderCartPreview(); return; }

    var insightRange = event.target.closest('[data-page-panel="insights"] .header-actions .btn');
    if (insightRange) {
      var insightLabel = insightRange.querySelector('.range-label');
      var currentRange = insightLabel ? insightLabel.textContent : insightRange.textContent;
      if (insightLabel) insightLabel.textContent = currentRange.indexOf('30') !== -1 ? 'Last 7 days' : currentRange.indexOf('7') !== -1 ? 'Last 90 days' : 'Last 30 days';
      toast('Insight range updated using sample data.'); return;
    }

    var action = event.target.closest('[data-action]');
    if (!action) return;
    var name = action.getAttribute('data-action');
    if (name === 'toggle-settings-menu') toggleSettingsMobileMenu();
    else if (name === 'toggle-cart-menu') toggleCartMobileMenu();
    else if (name === 'new-rule') openNewRuleChooser();
    else if (name === 'close-new-rule') cancelNewRuleChooser();
    else if (name === 'close-resource-picker') hideModal('#resource-picker-modal');
    else if (name === 'confirm-resource-picker') confirmResourcePicker();
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
    else if (name === 'save-cart') { setText('#cart-publish-badge', 'Draft saved'); toast('Cart drawer settings saved as a draft.'); }
    else if (name === 'publish-cart') { setText('#cart-publish-badge', 'Published'); one('#cart-publish-badge').className = 'badge published'; toast('Prototype publication confirmed. Version 4 is now the published preview.'); }
    else if (name === 'unpublish-cart') { setText('#cart-publish-badge', 'Disabled'); toast('Cart Drawer features disabled in the prototype. The theme drawer remains available.'); }
    else if (name === 'rollback-cart') toast('Version 3 restored as a new draft. Review it before publishing.');
    else if (name === 'theme-help') toast('Compatibility request prepared with theme name, version and diagnostic snapshot.');
    else if (name === 'refresh-theme-preview') { var captured = new Date(); setText('#theme-preview-time', 'captured at ' + captured.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); setText('#theme-captured-time', 'Just now'); one('#theme-preview-pane').classList.remove('snapshot-refreshed'); window.requestAnimationFrame(function () { one('#theme-preview-pane').classList.add('snapshot-refreshed'); }); renderCartPreview(); toast('Theme snapshot refreshed using the current test cart.'); }
    else if (name === 'open-theme-editor') toast('Production handoff: open Shopify theme editor to change theme-owned layout and styling.');
    else if (name === 'reset-theme') { resetDrawerDesign(); toast('Theme defaults restored.'); }
    else if (name === 'reset-test-cart') { resetTestCart(); toast('Test cart reset.'); }
    else if (name === 'apply-test-discount') { one('#preview-discount-input').value = one('#test-cart-discount').value || 'SAVE10'; state.cartDiscount = 5; one('#discount-result').classList.remove('hide'); renderCartPreview(); toast('Test discount applied.'); }
    else if (name === 'add-condition') { addDisplayCondition(); toast('Display condition added.'); }
    else if (name === 'remove-condition') { var condition = action.closest('.condition-row'); if (condition) condition.remove(); toast('Display condition removed.'); }
    else if (name === 'choose-markets') { one('#market-selection').classList.remove('hide'); toast('Market selector simulated: United States and Canada selected.'); }
    else if (name === 'back-to-feature-journey') showFeatureJourney();
    else if (name === 'back-to-feature-group') showFeatureGroup(state.cartFeatureGroup);
    else if (name === 'preview-recipes') showCartWorkspace('start');
    else if (name === 'apply-smart-recipe') { ['progress', 'offer', 'summary'].forEach(function (module) { var control = one('[data-module-switch="' + module + '"]'); if (control) { control.classList.add('on'); control.setAttribute('aria-pressed', 'true'); } }); var trust = one('[data-preview-widget="trust"]'); if (trust) { trust.classList.add('on'); trust.setAttribute('aria-pressed', 'true'); } renderCartPreview(); toast('Smart recipe applied to this draft. Review each cart moment before publishing.'); }
    else if (name === 'reset-widget') { one('#cart-message').value = cartConfig[state.cartModule].message; renderCartPreview(); toast('Feature defaults restored.'); }
    else if (name === 'duplicate-widget') toast(cartConfig[state.cartModule].title + ' duplicated as a draft widget.');
    else if (name === 'remove-widget') { var widget = one('[data-widget="' + (state.cartModule === 'offer' ? 'upsell' : state.cartModule) + '"]'); var widgetSwitch = widget && widget.querySelector('.switch'); if (widgetSwitch) { widgetSwitch.classList.remove('on'); widgetSwitch.setAttribute('aria-pressed', 'false'); } showFeatureGroup(state.cartFeatureGroup); renderCartPreview(); toast('Feature removed from the draft preview.'); }
    else if (name === 'finish-widget') { showFeatureGroup(state.cartFeatureGroup); toast('Feature saved to the draft.'); }
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
      all('.scope-choices .choice').forEach(function (choice) { choice.classList.toggle('active', !!choice.querySelector('input:checked')); });
      var scope = input.value;
      one('#rule-resource-selection').classList.toggle('hide', scope === 'all');
      setText('#resource-selection-title', scope === 'collections' ? 'Selected collections' : 'Selected products');
      setText('#resource-selection-copy', scope === 'all' ? 'All eligible products are included.' : 'No resources selected.');
      setText('#rule-resource-picker-button', scope === 'collections' ? 'Select collections' : 'Select products');
      state.ruleResourceIds = [];
      one('#rule-selected-resources').innerHTML = '';
    });
  });

  all('input[name="customer-eligibility"], input[name="market-scope"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var group = input.closest('.choice-row');
      group.querySelectorAll('.choice').forEach(function (choice) { choice.classList.toggle('active', !!choice.querySelector('input:checked')); });
      if (input.name === 'market-scope') one('#market-selection').classList.toggle('hide', input.value !== 'selected');
    });
  });

  all('input[name="drawer-mode"]').forEach(function (input) {
    input.addEventListener('change', function () {
      state.drawerMode = input.value;
      all('.mode-option').forEach(function (option) { option.classList.toggle('active', !!option.querySelector('input:checked')); });
      setText('#compatibility-copy', input.value === 'theme' ? 'Theme mode supports progress, rule alerts, summary and upsells. Theme structure remains read-only.' : 'KartVantage mode unlocks the complete design, layout and widget system.');
      updateDrawerModeUI();
      var defaultPreset = input.value === 'theme' ? one('[data-cart-preset="guided"]') : one('[data-cart-preset="conversion"]');
      if (defaultPreset) selectCartPreset(defaultPreset.getAttribute('data-cart-preset'), defaultPreset);
      setPreviewSurface(input.value === 'theme' ? 'theme' : 'kartvantage');
      renderCartPreview();
      toast(input.value === 'theme' ? 'Existing theme drawer preserved.' : 'KartVantage drawer selected for this draft.');
    });
  });

  one('#minimum-input').addEventListener('input', renderRulePreview);
  one('#maximum-input').addEventListener('input', renderRulePreview);
  one('#minimum-message').addEventListener('input', function () { if (state.rulePreviewState === 'minimum') renderRulePreview(); });
  one('#maximum-message').addEventListener('input', function () { if (state.rulePreviewState === 'maximum') renderRulePreview(); });
  one('#message-input').addEventListener('input', renderRuleMessage);
  one('#rule-status').addEventListener('change', function () { setText('#config-status-badge', one('#rule-status').value === 'active' ? 'Active' : 'Draft'); one('#config-status-badge').className = one('#rule-status').value === 'active' ? 'badge published' : 'badge'; });
  ['#cart-style', '#cart-alignment', '#drawer-font', '#drawer-button-weight', '#quantity-style', '#preview-state-select', '#preview-device-select'].forEach(function (selector) {
    one(selector).addEventListener('change', function () {
      if (selector === '#preview-state-select') state.cartState = one(selector).value;
      if (selector === '#preview-device-select') setCartDevice(one(selector).value);
      renderCartPreview();
    });
  });
  ['#drawer-bg', '#drawer-header-bg', '#drawer-primary', '#drawer-primary-text', '#drawer-text', '#drawer-accent', '#drawer-success', '#drawer-warning', '#drawer-width', '#drawer-radius', '#drawer-padding', '#drawer-heading-size', '#drawer-body-size', '#button-radius'].forEach(function (selector) { one(selector).addEventListener('input', renderCartPreview); });
  one('#cart-message').addEventListener('input', renderCartPreview);
  one('#upsell-source').addEventListener('change', function () { state.upsellSource = one('#upsell-source').value; updateUpsellSelectionSummary(); });
  one('#upsell-limit').addEventListener('input', function () { var limit = Math.max(1, Math.min(4, Number(one('#upsell-limit').value || 4))); if (state.upsellProducts.length > limit) { state.upsellProducts = state.upsellProducts.slice(0, limit); state.upsellIndex = 0; updateUpsellSelectionSummary(); renderCartPreview(); } });
  one('#resource-picker-search').addEventListener('input', renderResourcePicker);
  one('#resource-picker-list').addEventListener('change', function (event) {
    var item = event.target.closest('[name="resource-picker-item"]');
    if (!item) return;
    if (state.resourcePickerType === 'collection' && state.resourcePickerContext !== 'rule') state.resourcePickerSelection = item.checked ? [item.value] : [];
    else if (item.checked && (state.resourcePickerContext === 'rule' || state.resourcePickerSelection.length < 4)) state.resourcePickerSelection.push(item.value);
    else if (!item.checked) state.resourcePickerSelection = state.resourcePickerSelection.filter(function (id) { return id !== item.value; });
    renderResourcePicker();
  });
  one('#test-cart-quantity').addEventListener('input', function () { state.cartQuantity = Math.max(0, Number(one('#test-cart-quantity').value || 0)); state.cartSubtotal = state.cartQuantity * 25; state.cartState = state.cartQuantity ? 'issue' : 'empty'; renderCartPreview(); });
  one('#test-cart-state').addEventListener('change', function () { state.cartState = one('#test-cart-state').value; if (state.cartState === 'valid') { state.cartSubtotal = 90; state.cartQuantity = 4; } renderCartPreview(); });
  one('#addon-checkbox').addEventListener('change', function () { state.cartSubtotal += one('#addon-checkbox').checked ? 5 : -5; renderCartPreview(); });
  one('#run-test').addEventListener('click', function () {
    var selectedRule = one('#test-rule').selectedIndex;
    var subtotal = Number(one('#test-subtotal').value || 0);
    var items = Number(one('#test-items').value || 0);
    var allowed = selectedRule === 0 ? subtotal >= 50 : selectedRule === 1 ? items >= 1 && items <= 4 : items >= 2 && items <= 20;
    var result = one('#test-result');
    result.querySelector('.result-x').textContent = allowed ? '✓' : '×';
    result.querySelector('.result-x').style.color = allowed ? 'var(--success)' : '';
    result.querySelector('.result-x').style.background = allowed ? 'var(--success-bg)' : '';
    result.querySelector('.badge').textContent = allowed ? 'Allowed' : 'Blocked';
    result.querySelector('.badge').className = allowed ? 'badge published' : 'badge warning';
    result.querySelector('.card-title').textContent = allowed ? 'Cart meets this rule' : 'Cart does not meet this rule';
    var failCopy = selectedRule === 0 ? '<strong>Add $' + Math.max(0, 50 - subtotal).toFixed(2) + ' more to continue</strong>Your order must reach $50.00 before checkout.' : selectedRule === 1 ? '<strong>Product quantity is outside 1–4</strong>Update the selected product quantity.' : '<strong>Cart items must stay between 2 and 20</strong>Current total: ' + items + '.';
    result.querySelector('.sf-alert').innerHTML = allowed ? '<strong>Ready for checkout</strong>The selected rule is satisfied.' : failCopy;
    setText('#trace-subtotal', selectedRule === 0 ? '$' + subtotal.toFixed(2) : items + ' items');
    var rows = result.querySelectorAll('.trace-row strong');
    rows[rows.length - 1].textContent = allowed ? 'Allowed' : 'Blocked';
    rows[rows.length - 1].style.color = allowed ? 'var(--success)' : 'var(--danger)';
    toast('Rule test completed.');
  });

  enhanceSelects();
  all('.chevron').forEach(function (chevron) { chevron.textContent = ''; chevron.setAttribute('aria-hidden', 'true'); });
  setSidebar(!sidebarCompact);
  all('.switch').forEach(function (button) { button.setAttribute('aria-pressed', button.classList.contains('on') ? 'true' : 'false'); });
  one('#publish-modal').addEventListener('click', function (event) { if (event.target === one('#publish-modal')) closePublishReview(); });
  one('#new-rule-modal').addEventListener('click', function (event) { if (event.target === one('#new-rule-modal')) cancelNewRuleChooser(); });
  one('#resource-picker-modal').addEventListener('click', function (event) { if (event.target === one('#resource-picker-modal')) hideModal('#resource-picker-modal'); });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeSettingsMobileMenu();
    closeCartMobileMenu();
    if (!one('#publish-modal').classList.contains('hide')) closePublishReview();
    if (!one('#new-rule-modal').classList.contains('hide')) cancelNewRuleChooser();
    if (!one('#resource-picker-modal').classList.contains('hide')) hideModal('#resource-picker-modal');
  });
  syncRouteFromLocation();
  showCartWorkspace('start');
  updateDrawerModeUI();
  setCartDevice('desktop');
  setPreviewSurface('theme');
  renderCartPreview();
  window.setInterval(function () {
    if (state.page !== 'cart' || state.upsellProducts.length < 2 || state.offerAdded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var upsell = one('#cart-offer-preview');
    if (!upsell || upsell.classList.contains('hide') || upsell.matches(':hover')) return;
    state.upsellIndex = (state.upsellIndex + 1) % state.upsellProducts.length;
    one('#upsell-slide').classList.add('is-changing');
    window.setTimeout(function () { renderCartPreview(); one('#upsell-slide').classList.remove('is-changing'); }, 120);
  }, 3200);
})();
