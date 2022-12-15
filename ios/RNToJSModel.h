//
//  RCTModel.h
//  TestDemo
//
//  Created on 2019/10/8.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNToJSModel : RCTEventEmitter<RCTBridgeModule>
//+ (instancetype)shareInstance;
+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload;//iOS给RN发送数据
@end

NS_ASSUME_NONNULL_END
