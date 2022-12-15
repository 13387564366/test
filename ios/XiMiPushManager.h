//
//  XimiPushManager.h
//  RaxApple
//
//  Created by cui on 1/16/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTViewManager.h"

@class RCTEventDispatcher;

@interface XiMiPushManager : RCTViewManager

- (void)notifacitionEventReminderReceived:(NSDictionary *)notificationInfo;
- (void)notificationNativeTrigger;

+ (id)sharedInstance;

+ (id)allocWithZone:(NSZone *)zone;

+ (id)copyWithZone:(struct _NSZone *)zone;

+ (id)mutableCopyWithZone:(struct _NSZone *)zone;

- (id)init;

@end
