//
//  XimiPushManager.m
//  RaxApple
//
//  Created by cui on 1/16/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "XiMiPushManager.h"
#import "MiPushSDK.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"



@implementation XiMiPushManager
{
  RCTEventDispatcher *_eventDispatcher;
}

static XiMiPushManager *STATUSBARNOTIFICATION_SINGLETON = nil;
static bool isFirstAccess = YES;

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

#pragma mark - instance init
+ (id)sharedInstance
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    isFirstAccess = NO;
    STATUSBARNOTIFICATION_SINGLETON = [[super allocWithZone:NULL] init];
  });
  
  return STATUSBARNOTIFICATION_SINGLETON;
}

+ (id) allocWithZone:(NSZone *)zone {
  return [self sharedInstance];
}

+ (id)copyWithZone:(struct _NSZone *)zone {
  return [self sharedInstance];
}

+ (id)mutableCopyWithZone:(struct _NSZone *)zone {
  return [self sharedInstance];
}

- (id) init {
  if(STATUSBARNOTIFICATION_SINGLETON){
    return STATUSBARNOTIFICATION_SINGLETON;
  }
  if (isFirstAccess) {
    [self doesNotRecognizeSelector:_cmd];
  }
  self = [super init];
  return self;
}

#pragma mark - RCTViewManager export native API
//  进行设置封装常量给JavaScript进行调用
-(NSDictionary *)constantsToExport
{
  // 此处定义的常量为js订阅原生通知的通知名
  return @{@"receiveNotificationName":@"receive_notification_test"};
}

//  进行设置发送事件通知给JavaScript端
- (void)notifacitionEventReminderReceived:(NSDictionary *)notificationInfo
{
  [self.bridge.eventDispatcher sendAppEventWithName:@"XiMiNews"body:notificationInfo];
}

//  开始订阅通知事件
RCT_EXPORT_METHOD(startReceiveNotification:(NSString *)name)
{
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(notifacitionEventReminderReceived:)name:name object:nil];
}

//此函数是为了测试OC->JS过程，触发事件的函数
RCT_EXPORT_METHOD(notificationTrigger:(NSDictionary *)notificationInfo)
{
  [self notifacitionEventReminderReceived:notificationInfo];
//  NSDictionary *userInfo = @{@"key": @"这是一个本地通知"};
//  UILocalNotification *notification = [[UILocalNotification alloc]init];
//  notification.alertBody = @"这是一条本地通知";
//  notification.applicationIconBadgeNumber = 2;
//  notification.userInfo = userInfo;
//  [[UIApplication sharedApplication] scheduleLocalNotification:notification];
}

-(void)notificationNativeTrigger: (NSDictionary *)notificationInfo
{
  [self notifacitionEventReminderReceived:notificationInfo];
}

RCT_EXPORT_METHOD(getMiPushRegID:(RCTResponseSenderBlock)callback) {
  NSString *regID =[MiPushSDK getRegId]?:@"10000";
  callback(@[[NSNull null],regID]);
}
@end
