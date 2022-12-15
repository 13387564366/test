/*
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * AppActions
 */
import React from 'react';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants'

const _showLoading = () => {
    const isDispatching = AppDispatcher.isDispatching();
    if (!isDispatching) {
        AppDispatcher.dispatch({
            actionType: AppConstants.LOADING_SHOW
        });
    }
};

const _dismissLoading = () => {
    const isDispatching = AppDispatcher.isDispatching();
    if (!isDispatching) {
        AppDispatcher.dispatch({
            actionType: AppConstants.LOADING_HIDE
        });
    }
};

const AppActions = {
    showLoading: () => _showLoading(),
    dismissLoading: () => _dismissLoading(),
    initProfile: () => AppDispatcher.dispatch({actionType: AppConstants.INIT_PROFILE}),
};

module.exports = AppActions;

