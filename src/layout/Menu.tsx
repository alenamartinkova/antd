import * as React from 'react';

import { Link, match as Match, Route } from 'react-router-dom';
import { appendStringPath, searchChildrenWithType } from '../utils';

import { Menu as AntdMenu } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { MenuTheme } from 'antd/lib/menu/MenuContext';

export interface MenuItemProps extends React.Props<any> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subitems?: React.ReactElement<MenuItemProps>[];
}
interface MenuItemComponentProps extends MenuItemProps {
  path: string;
}

export interface MenuConfig {
  theme?: MenuTheme;
}
export interface MenuProps extends MenuConfig {
  // items?: React.ReactElement<MenuItemProps>[];
}

export class MenuItem extends React.Component<MenuItemProps> {}

export class MenuItemComponent extends React.Component<MenuItemComponentProps> {
  render(): any {
    const { ...item } = this.props;
    return (
      <Link to={item.path} key={item.path}>
        {item.icon}
        <span className="nav-text">{item.title}</span>
      </Link>
    );
  }
}

export class Menu extends React.Component<MenuProps> {
  renderItems(
    items: React.ReactElement<MenuItemProps>[],
    parentPath: string
  ): JSX.Element[] {
    return items.map((item: React.ReactElement<MenuItemProps>) => {
      const subitems =
        item.props.subitems ||
        searchChildrenWithType(item.props.children, MenuItem);

      const key = item.key;
      if (!key) {
        return <MenuItemComponent {...item.props} path="#" />;
      }
      const resolvedPath = appendStringPath(parentPath, key.toString());

      if (subitems && subitems.length > 0) {
        return (
          <AntdMenu.SubMenu
            key={'sub_' + resolvedPath}
            title={
              <span>
                {item.props.icon || <FolderOutlined />}
                <span>{item.props.title}</span>
              </span>
            }
          >
            {this.renderItems(subitems, resolvedPath)}
          </AntdMenu.SubMenu>
        );
      }

      return (
        <AntdMenu.Item key={resolvedPath}>
          <MenuItemComponent {...item.props} path={resolvedPath} />
        </AntdMenu.Item>
      );
    });
  }

  defaultSelectedKeys(match: Match<any> | null): string[] {
    if (match === null) {
      return [];
    }
    let res: string[] = [];
    let buff = '/';

    if (match.url === '/') {
      res.push('/');
    } else {
      match.url
        .split('/')
        .filter((x) => x)
        .forEach((name: string) => {
          buff += name;
          res.push(buff + '/');
          buff += '/';
        });
    }
    return res;
  }

  defaultOpenKeys(match: Match<any> | null): string[] {
    if (match === null) {
      return [];
    }
    const items = searchChildrenWithType(this.props.children, MenuItem);

    for (let item of items) {
      const subitems = searchChildrenWithType(item.props.children, MenuItem);
      for (let subitem of subitems) {
        if (item.key && subitem.key) {
          const resolvedPath = appendStringPath(
            item.key.toString(),
            subitem.key.toString()
          );
          if (resolvedPath === match.url) {
            const parentPath = appendStringPath(item.key.toString(), '');
            return ['sub_' + parentPath];
          }
        }
      }
    }
    return [];
  }

  render() {
    const items = searchChildrenWithType(this.props.children, MenuItem);
    if (items.length === 0) {
      return null;
    }
    return (
      <Route
        path="*"
        exact={true}
        children={({ match }) => {
          return (
            <AntdMenu
              theme="dark"
              mode="inline"
              selectedKeys={this.defaultSelectedKeys(match)}
              defaultOpenKeys={this.defaultOpenKeys(match)}
              {...this.props}
              style={{
                overflow: 'auto',
                height: 'calc(100vh - 64px)',
              }}
            >
              {this.renderItems(items, '/')}
            </AntdMenu>
          );
        }}
      />
    );
  }
}
