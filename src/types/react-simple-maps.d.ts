declare module "react-simple-maps" {
  import { ComponentProps, ReactNode, CSSProperties } from "react";

  interface GeographyStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
  }

  interface GeographyStyleSpec {
    default?: GeographyStyle;
    hover?: GeographyStyle;
    pressed?: GeographyStyle;
  }

  interface GeoFeature {
    rsmKey: string;
    id: string;
    type: string;
    geometry: object;
    properties: Record<string, unknown>;
  }

  export function ComposableMap(props: {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    viewBox?: string;
    style?: CSSProperties;
    children?: ReactNode;
  }): JSX.Element;

  export function Geographies(props: {
    geography: string | object;
    children: (args: { geographies: GeoFeature[] }) => ReactNode;
  }): JSX.Element;

  export function Geography(props: {
    geography: GeoFeature;
    style?: GeographyStyleSpec;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
  }): JSX.Element;

  export function Marker(props: {
    coordinates: [number, number];
    children?: ReactNode;
  }): JSX.Element;

  export function Annotation(props: {
    subject: [number, number];
    dx?: number;
    dy?: number;
    children?: ReactNode;
  }): JSX.Element;
}
