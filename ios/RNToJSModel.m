//
//  RCTModel.m
//  TestDemo
//
//  Created on 2019/10/8.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RNToJSModel.h"
#import "MiPushSDK.h"
@implementation RNToJSModel

@synthesize bridge = _bridge;

//导出模块 不添加参数即默认认为这个oc类的名字
RCT_EXPORT_MODULE();

//RN跳转原生界面
/**************************************** RN Call iOS ***************************************************/
RCT_EXPORT_METHOD(getMiPushRegID:(RCTResponseSenderBlock)callback) {
  NSString *regID =[MiPushSDK getRegId]?:@"10000";
  callback(@[[NSNull null],regID]);
}


/**************************************** ios 传数据给 rn ***************************************************/

- (NSArray<NSString *> *)supportedEvents {
  return @[@"EventReminder",@"getMiPushRegID"]; //这里返回的将是你要发送的消息名的数组。
}
/*
 iOS支持方法名一样但是参数不一样的方法，视为两个不同的方法
 但是RN调用iOS这样的方法会出错的
 所以最好别把方法名声明成一样的
 */

-(void)startObserving{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(emitEventInternal:)
                                               name:@"event-emitted" object:nil];
}
- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitEventInternal:(NSNotification *)notification
{
  NSDictionary *dict = notification.userInfo;
  NSString *name = dict[@"name"]?:@"";
  NSDictionary *body = dict[@"body"]?:@{};
  
  [self sendEventWithName:name body:body];
}

+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload
{
  NSDictionary *userInfo = @{@"name":name,
                             @"body":payload?:@{}};
  [[NSNotificationCenter defaultCenter] postNotificationName:@"event-emitted"
                                                      object:nil
                                                    userInfo:userInfo];
}

@end
