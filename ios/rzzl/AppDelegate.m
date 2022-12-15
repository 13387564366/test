/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "RNToJSModel.h"
#import "XiMiPushManager.h"
#import "Orientation.h"

#import "IQKeyboardManager.h"

typedef enum {
  AutoUpdate,
  Release,
  Debug,
} StartMode;

@interface AppDelegate()

@property (nonatomic, strong)RCTRootView *rootView;

@end


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  if (@available(iOS 11.0, *)){
    [[UIScrollView appearance] setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever];
  }
  
  
  StartMode startType = Release;
  NSURL *jsCodeLocation;
  if (startType == AutoUpdate) {
    
  } else if (startType == Release) {
    
    jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  } else {
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  }
  self.rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                              moduleName:@"rzzl"
                                       initialProperties:nil
                                           launchOptions:launchOptions];
  self.rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = self.rootView;
  
  
  // Create loading view
  CGFloat width = [UIScreen mainScreen].bounds.size.width;
  CGFloat height = [UIScreen mainScreen].bounds.size.height;
  CGFloat rate = 2/3.f;
  UIImageView *imageView = [[UIImageView alloc]initWithFrame:CGRectMake((width-width*rate)/2.f, (height-width*rate)/2.f, width*rate, width*rate)];
  imageView.image = [UIImage imageNamed:@"icon-1024"];
  UIView *loadingView = [[UIView alloc] initWithFrame:[UIScreen mainScreen].bounds];
  loadingView.backgroundColor = [UIColor whiteColor];
  loadingView.contentMode = UIViewContentModeBottom;
  [loadingView addSubview: imageView];
  self.rootView.loadingView = loadingView;
  
  
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // IQKeyboardManager ToolBar Handler
  [[IQKeyboardManager sharedManager] setShouldToolbarUsesTextFieldTintColor:NO];
  [[IQKeyboardManager sharedManager] setToolbarDoneBarButtonItemText:@"完成"];
  [[IQKeyboardManager sharedManager] setToolbarTintColor:[UIColor colorWithRed:47/255.0
                                                                         green:134/255.0
                                                                          blue:213/255.0
                                                                         alpha:1.0]];
  
  // MiPush register and connnect
  [MiPushSDK registerMiPush:self type:0 connect:YES];
  
  // 处理点击通知打开app的逻辑
  NSDictionary* userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if(userInfo){//推送信息
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"gg" message:[NSString stringWithFormat:@"%@", userInfo] preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *act = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
      
    }];
    [alert addAction:act];
    [[XiMiPushManager sharedInstance] notifacitionEventReminderReceived:userInfo];
  }
  return YES;
}

// orientation
- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  while ([[UIDevice currentDevice] isGeneratingDeviceOrientationNotifications]) {
    [[UIDevice currentDevice] endGeneratingDeviceOrientationNotifications];
  }
  
  //  return [Orientation getOrientation];
  return UIInterfaceOrientationMaskAll;
}

#pragma mark - UIApplicationDelegate
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // 注册APNS成功, 注册deviceToken
  NSLog(@"[MiPushSDK bindDeviceToken:deviceToken];");
  [MiPushSDK bindDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)app didFailToRegisterForRemoteNotificationsWithError:(NSError *)err
{
  // 注册APNS失败
  // 自行处理
  NSLog(@"%@",err);
}

-(void)applicationDidBecomeActive:(UIApplication *)application{
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
}

#pragma mark - MiPushSDKDelegates

- (void)miPushRequestSuccWithSelector:(NSString *)selector data:(NSDictionary *)data
{
  // 请求成功
  if ([selector isEqualToString:@"bindDeviceToken:"]) {
    [RNToJSModel emitEventWithName:@"getMiPushRegID" andPayload:@{@"regId":data[@"regid"]}];
  }
}
- (void)miPushRequestErrWithSelector:(NSString *)selector error:(int)error data:(NSDictionary *)data
{
  // 请求失败
  NSLog(@"miPushRequestErrWithSelector error = %d", error);
}

- ( void )miPushReceiveNotification:( NSDictionary *)data
{
  // 长连接收到的消息。消息格式跟APNs格式一样
}


- ( void )application:( UIApplication *)application didReceiveRemoteNotification:( NSDictionary *)userInfo
{
  [MiPushSDK handleReceiveRemoteNotification :userInfo];
  // 使用此方法后，所有消息会进行去重，然后通过miPushReceiveNotification:回调返回给App
  if (application.applicationState == UIApplicationStateActive) {
    UILocalNotification *localNotification = [[UILocalNotification alloc] init];
    localNotification.userInfo = userInfo;
    localNotification.soundName = UILocalNotificationDefaultSoundName;
    localNotification.alertBody = [[userInfo objectForKey:@"aps"] objectForKey:@"alert"];
    localNotification.fireDate = [NSDate date];
    [[UIApplication sharedApplication] scheduleLocalNotification:localNotification];
    
    [[XiMiPushManager sharedInstance] notifacitionEventReminderReceived:localNotification.userInfo];
  }
  //如果是在后台挂起，用户点击进入是UIApplicationStateInactive这个状态
  else if (application.applicationState == UIApplicationStateInactive){
    //......
    [[XiMiPushManager sharedInstance] notifacitionEventReminderReceived:userInfo];
  }
}

// iOS10新加入的回调方法
// 应用在前台收到通知
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [MiPushSDK handleReceiveRemoteNotification:userInfo];
  }
  [[XiMiPushManager sharedInstance] notifacitionEventReminderReceived:userInfo];
  //    completionHandler(UNNotificationPresentationOptionAlert);
}

// 点击通知进入应用
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [MiPushSDK handleReceiveRemoteNotification:userInfo];
  }
  [[XiMiPushManager sharedInstance] notifacitionEventReminderReceived:userInfo];
  completionHandler();
}


@end
