import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewProps } from 'react-native';

import { RNIContextMenuButton, RNIContextMenuButtonBaseProps } from '../native_components/RNIContextMenuButton';

import type { OnMenuWillShowEvent, OnMenuWillHideEvent, OnMenuDidShowEvent, OnMenuDidHideEvent, OnMenuWillCancelEvent, OnMenuDidCancelEvent, OnPressMenuItemEvent } from '../types/MenuEvents';

// @ts-ignore - TODO
import { ActionSheetFallback } from '../functions/ActionSheetFallback';
import { ContextMenuView } from './ContextMenuView';

import { LIB_ENV, IS_PLATFORM_IOS } from '../constants/LibEnv';


export type ContextMenuButtonBaseProps = Pick<RNIContextMenuButtonBaseProps,
  | 'enableContextMenu'
  | 'isMenuPrimaryAction'
  | 'menuConfig'
  // Lifecycle Events
  | 'onMenuWillShow'
  | 'onMenuWillHide'
  | 'onMenuWillCancel'
  | 'onMenuDidShow'
  | 'onMenuDidHide'
  | 'onMenuDidCancel'
  // `OnPress` Events
  | 'onPressMenuItem'
> & {
  useActionSheetFallback?: boolean;
  wrapNativeComponent?: boolean;
};

export type ContextMenuButtonProps = 
  ViewProps & ContextMenuButtonBaseProps;

export type ContextMenuButtonState = {
  menuVisible: boolean;
};

export class ContextMenuButton extends React.PureComponent<ContextMenuButtonProps, ContextMenuButtonState> {

  constructor(props: ContextMenuButtonProps){
    super(props);

    this.state = {
      menuVisible: false,
    };
  };

  getProps = () => {
    const {
      menuConfig,
      enableContextMenu,
      isMenuPrimaryAction,
      useActionSheetFallback,
      wrapNativeComponent,
      onMenuWillShow,
      onMenuWillHide,
      onMenuWillCancel,
      onMenuDidShow,
      onMenuDidHide,
      onMenuDidCancel,
      onPressMenuItem,
      ...viewProps 
    } = this.props;

    return {
      // A. Provide default values to props...
      enableContextMenu: (
        enableContextMenu ?? true
      ),
      wrapNativeComponent: (
        wrapNativeComponent ?? true
      ),
      useActionSheetFallback: (
        useActionSheetFallback ?? !LIB_ENV.isContextMenuViewSupported
      ),

      // B. Pass down props...
      menuConfig,
      isMenuPrimaryAction,
      onMenuWillShow,
      onMenuWillHide,
      onMenuWillCancel,
      onMenuDidShow,
      onMenuDidHide,
      onMenuDidCancel,
      onPressMenuItem,
      // C. Move all the default view-related
      //    props here...
      viewProps
    };
  };

  //#region - Event Handlers
  _handleOnLongPress = async () => {
    const props = this.props;

    const selectedItem = 
      await ActionSheetFallback.show(props.menuConfig);
  
    if(selectedItem == null){
      // A. cancelled pressed
      props.onMenuDidCancel?.({
        isUsingActionSheetFallback: true
      });

    } else {
      // B. an item was selected
      props.onPressMenuItem?.({
        isUsingActionSheetFallback: true,
        nativeEvent: {
          ...selectedItem,
        }
      });
    };
  };

  _handleOnMenuWillShow: OnMenuWillShowEvent = (event) => {
    this.props.onMenuWillShow?.(event);
    event.stopPropagation();

    this.setState({menuVisible: true});
  };

  _handleOnMenuWillHide: OnMenuWillHideEvent = (event) => {
    this.props.onMenuWillHide?.(event);
    event.stopPropagation();

    this.setState({menuVisible: false});
  };

  _handleOnMenuWillCancel: OnMenuWillCancelEvent = (event) => {
    this.props.onMenuWillCancel?.(event);
    event.stopPropagation();
  };

  _handleOnMenuDidShow: OnMenuDidShowEvent = (event) => {
    this.props.onMenuDidShow?.(event);
    event.stopPropagation();
  };

  _handleOnMenuDidHide: OnMenuDidHideEvent = (event) => {
    this.props.onMenuDidHide?.(event);
    event.stopPropagation();
  };

  _handleOnMenuDidCancel: OnMenuDidCancelEvent = (event) => {
    this.props.onMenuDidCancel?.(event);

    // guard: event is a native event
    if(event.isUsingActionSheetFallback) return;
    event.stopPropagation();
  };

  _handleOnPressMenuItem: OnPressMenuItemEvent = (event) => {
    this.props.onPressMenuItem?.(event);

    // guard: event is a native event
    if(event.isUsingActionSheetFallback) return;
    event.stopPropagation();
  };
  //#endregion

  render(){
    const props = this.getProps();
    const { menuVisible } = this.state;

    const isNativeComponentSupported = (
      LIB_ENV.isContextMenuButtonSupported && 
      !props.useActionSheetFallback
    );

    const shouldUseActionSheetFallback = (
      IS_PLATFORM_IOS && props.useActionSheetFallback
    );

    const nativeComponentProps: RNIContextMenuButtonBaseProps = {
      menuConfig: props.menuConfig,
      enableContextMenu: props.enableContextMenu,
      isMenuPrimaryAction: props.isMenuPrimaryAction,

      // event handlers
      onMenuWillShow  : this._handleOnMenuWillShow  ,
      onMenuWillHide  : this._handleOnMenuWillHide  ,
      onMenuDidShow   : this._handleOnMenuDidShow   ,
      onMenuDidHide   : this._handleOnMenuDidHide   ,
      onMenuDidCancel : this._handleOnMenuDidCancel ,
      onMenuWillCancel: this._handleOnMenuWillCancel,
      onPressMenuItem : this._handleOnPressMenuItem ,
    };

    if(isNativeComponentSupported){
      const childItems = React.Children.map(this.props.children, child => 
        //@ts-ignore
        React.cloneElement(child, {menuVisible})
      );

      const nativeComponent = (LIB_ENV.isContextMenuButtonSupported? (
        <RNIContextMenuButton
          {...(props.wrapNativeComponent && props.viewProps)}
          {...nativeComponentProps}
          // override style prop
          style={(props.wrapNativeComponent
            ? styles.wrappedMenuButton
            : [styles.menuButton, props.viewProps.style]
          )}
        >
          {childItems}
        </RNIContextMenuButton>
      ):(
        <ContextMenuView
          {...props.viewProps}
          {...nativeComponentProps}
        >
          {childItems}
        </ContextMenuView>
      ));

      if(props.wrapNativeComponent){
        return(
          <TouchableOpacity
            {...props.viewProps}
            activeOpacity={0.8}
          >
            {nativeComponent}
          </TouchableOpacity>
        );
      } else {
        return nativeComponent;
      };

    } else if(shouldUseActionSheetFallback){
      return (
        <TouchableOpacity 
          onLongPress={this._handleOnLongPress}
          activeOpacity={0.8}
          {...props.viewProps}
        >
          {this.props.children}
        </TouchableOpacity>
      );
      
    } else {
      return (
        <View {...props.viewProps}>
          {this.props.children}
        </View>
      );
    };
  };
};

const styles = StyleSheet.create({
  menuButton: {
    backgroundColor: 'transparent',
  },
  wrappedMenuButton: {
    flex: 1,
  },
});