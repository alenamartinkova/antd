import * as React from 'react';

import { Button, Layout, PageHeader, Result } from 'antd';
import { Link, Route, Switch } from 'react-router-dom';
import { Thunk, resolveOptionalThunk, resolveThunk } from 'ts-thunk';
import { appendStringPath, searchChildrenWithType } from '../utils';

import { PageHeaderProps } from 'antd/lib/page-header';
import { RouteComponentProps } from 'react-router';

export type StructureItemContent = Thunk<
  React.ReactNode,
  Partial<RouteComponentProps>
>;
export type StructureHeaderProps = Thunk<
  PageHeaderProps,
  Partial<RouteComponentProps>
>;

export interface StructureItemProps
  extends Partial<RouteComponentProps>,
    React.PropsWithChildren<any> {
  name: React.ReactNode;
  content?: StructureItemContent;
  header?: Partial<StructureHeaderProps>;
}

export interface ContentProps {
  items?: React.ReactElement<StructureItemProps>[];
}

export interface ContentState {
  error: Error | null;
}

export class StructureItem extends React.Component<StructureItemProps> {
  render(): any {
    const { header, breadcrumbs, content, ...rest } = this.props;

    let _header = resolveOptionalThunk(header, rest);
    return (
      <div>
        <div style={{ margin: '-30px 0px 0px' }}>
          <PageHeader
            title={rest.name}
            onBack={() => window.history.back()}
            {..._header}
          />
        </div>
        {resolveThunk(content, rest)}
      </div>
    );
  }
}

export class Structure extends React.Component<ContentProps, ContentState> {
  state: ContentState = { error: null };

  componentDidCatch(error: Error | null, info: object) {
    this.setState({ error: error || new Error(`empty error`) });
  }

  getRoutes(
    items: React.ReactElement<StructureItemProps>[],
    routes: JSX.Element[] | null = null,
    parentPath: string = ''
  ): JSX.Element[] {
    routes = routes || [];

    for (let item of items) {
      const path = item.key;
      if (!path) {
        continue;
      }

      const resolvedPath = appendStringPath(parentPath, path.toString());

      const route = (
        <Route
          key={resolvedPath}
          exact={true}
          path={resolvedPath}
          render={(renderProps) => (
            <StructureItem {...item.props} {...renderProps} />
          )}
        />
      );

      routes.push(route);

      const subitems = searchChildrenWithType(
        item.props.children,
        StructureItem
      );

      if (subitems && subitems.length > 0) {
        this.getRoutes(subitems, routes, resolvedPath);
      }
    }
    return routes;
  }

  render() {
    const { error } = this.state;

    if (error !== null) {
      const _error = error;
      return (
        <Layout.Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
            error {_error.message}
          </div>
        </Layout.Content>
      );
    }

    const pageNotFound = (
      <Route path="*">
        <Result
          status="404"
          title="Page not found"
          subTitle="Check page address or contact tech assistance"
          extra={
            <Link to="/">
              <Button type="primary">Home</Button>
            </Link>
          }
        />
      </Route>
    );

    const items = searchChildrenWithType(this.props.children, StructureItem);

    return (
      <Layout.Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <Switch>
          {this.getRoutes(items)}
          {pageNotFound}
        </Switch>
      </Layout.Content>
    );
  }
}
