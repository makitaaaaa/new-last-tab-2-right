"use strict";

(function () {

  /** @type {number} */
  let slideRightIndex = 0;
  /** @type {number} */
  let activeTabId = null;
  /** @type {number} */
  let activeWindowId = null;

  /**
   * @param {number} tabId 
   */
  const onTabActivated = (activeInfo) => {
    activeTabId = activeInfo.tabId;
    activeWindowId = activeInfo.windowId;
    slideRightIndex = 0;
  }

  /**
   * @param {browser.tabs.Tab} tab 
   */
  const onTabCreated = (tab) => {
    moveTabRight(tab, activeTabId, activeWindowId);
    return null;
  }

  /**
   * @param {browser.tabs.Tab} tab 
   * @param {number} workActiveTabId 
   * @param {number} workWindowTabId 
   */
  const moveTabRight = async (tab, workActiveTabId, workWindowTabId) => {
    try {
      if (workWindowTabId !== tab.windowId) {
        return null;
      }
      slideRightIndex++;
      let slideRightIndexWork = slideRightIndex;
      /** @type {browser.tabs.Tab} */
      let nextToTabs = await browser.tabs.query({
        currentWindow: true,
        index: tab.index + 1
      });
      if (nextToTabs.length > 0) {
        // not last tab
        return null;
      }
      let targetTab = await browser.tabs.get(workActiveTabId);
      let currentTab = targetTab;
      if (targetTab.pinned === true) {
        targetTab = await getLastPinnedTab();
      }
      let taregetMoveIndex = targetTab.index + slideRightIndexWork;
      if (tab.index === taregetMoveIndex) {
        return null;
      }
      // move tab
      await browser.tabs.move(tab.id, {
        index: taregetMoveIndex
      });
      if (targetTab.pinned === true) {
        let isTargetTabActive = tab.active;
        browser.tabs.update(tab.id, {
          active: true
        });
        if (isTargetTabActive === false) {
          browser.tabs.update(currentTab.id, {
            active: true
          });
        }
      }
      return null;
    } catch (e) {
      logging(e);
    }
    return null;

  }

  /**
   * @param {number} tabId 
   */
  const onTabRemoved = (tabId) => {
    slideRightIndex = 0;
  }

  /**
   * @param {number} windowId 
   */
  const onWindowsFocusChanged = (windowId) => {
    slideRightIndex = 0;
  }

  /** 
   * @return {browser.tabs.Tab}
   */
  const getActiveTab = async () => {
    let tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    if (tabs.length !== 1) {
      return null;
    }
    return tabs[0];
  }

  /** 
   * @return {browser.tabs.Tab}
   */
  const getLastPinnedTab = async () => {
    let tabs = await browser.tabs.query({
      pinned: true,
      currentWindow: true
    });
    if (tabs.length <= 0) {
      return null;
    }
    return tabs[tabs.length - 1];
  }

  /**
   * 
   * @param {[*]} args 
   */
  const logging = (...args) => {
    // eslint-disable-next-line no-console
    console.log(...args);
    // eslint-disable-next-line no-console
    console.trace();
  }

  /** 
   * 
   */
  const initialize = async () => {
    let activeTab = await getActiveTab();
    activeTabId = activeTab.id;
    activeWindowId = activeTab.windowId;
    browser.tabs.onActivated.addListener(onTabActivated);
    browser.tabs.onCreated.addListener(onTabCreated);
    browser.tabs.onRemoved.addListener(onTabRemoved);
    browser.windows.onFocusChanged.addListener(onWindowsFocusChanged)
    return null;
  }

  initialize();
})();