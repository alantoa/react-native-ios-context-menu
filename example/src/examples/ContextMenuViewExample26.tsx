import * as React from 'react';

import { ContextMenuView } from 'react-native-ios-context-menu';

import type { ContextMenuExampleProps } from './SharedExampleTypes';
import { ContextMenuCard } from '../components/ContextMenuCard';


export function ContextMenuViewExample26(props: ContextMenuExampleProps) {
  return (
    <ContextMenuView
      style={props.style}
      menuConfig={{
        menuTitle: 'ContextMenuViewExample26',
        menuItems: [{
          actionKey  : 'key-01'   ,
          actionTitle: 'Action #1',
          menuSubtitle: 'Use "IMAGE_REMOTE_URL" icon',
          icon: {
            type: 'IMAGE_REMOTE_URL',
            imageValue: {
              url: 'https://picsum.photos/id/1/100'
            },
          }
        }, {
          actionKey  : 'key-02'   ,
          actionTitle: 'Action #2',
          menuSubtitle: '"IMAGE_REMOTE_URL" + shouldLazyLoad',
          icon: {
            type: 'IMAGE_REMOTE_URL',
            imageValue: {
              url: 'https://picsum.photos/id/2/100'
            },
            imageLoadingConfig: {
              shouldLazyLoad: true,
            },
          }
        }, {
          actionKey  : 'key-03'   ,
          actionTitle: 'Action #3',
          menuSubtitle: '"IMAGE_REMOTE_URL" + shouldLazyLoad + shouldCache',
          icon: {
            type: 'IMAGE_REMOTE_URL',
            imageValue: {
              url: 'https://picsum.photos/id/2/100'
            },
            imageLoadingConfig: {
              shouldLazyLoad: true,
              shouldCache: true,
            },
          }
        }],
      }}
    >
      <ContextMenuCard
        index={props.index}
        title={'ContextMenuViewExample26'}
        subtitle={'ImageType Icons'}

        description={[
          `Context menu with actions that uses 'IMAGE_REMOTE_URL' icons`
        ]}
      />
    </ContextMenuView>
  );
};