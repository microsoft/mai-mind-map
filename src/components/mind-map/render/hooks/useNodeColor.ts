import { HSLColor, hsl } from 'd3-color';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';

import { NodeInterface } from '../layout';
import { Payload } from '../model/interface';
import { SizedRawNode } from '../node/interface';

export function useNodeColor(
  node: NodeInterface<SizedRawNode<Payload>> | null,
) {
  const { bgColor, textColor } = useMemo(() => {
    if (!node) {
      return {
        bgColor: '#fff',
        textColor: '#212429',
      };
    }
    const color = node.data.payload.hilight;

    let cHSL: HSLColor | undefined;
    if (color) {
      cHSL = hsl(color);
    }

    if (node.depth === 0) {
      let textColor = '#fff';
      let bgColor = '#0172DC';
      if (color && cHSL && !Number.isNaN(cHSL.l)) {
        bgColor = color;
        const l = cHSL.l;
        if (l > 0.75) {
          textColor = '#212429';
        }
      }
      return {
        bgColor: color || '#0172DC',
        textColor: '#fff',
      };
    } else if (node.depth === 1) {
      let textColor = '#212429';
      let bgColor = '#ecf2fb';
      if (color && cHSL && !Number.isNaN(cHSL.l)) {
        bgColor = color;
        const l = cHSL.l;
        if (l < 0.75) {
          textColor = '#fff';
        }
      }

      return {
        bgColor,
        textColor,
      };
    } else {
      let textColor = '#212429';
      if (color && cHSL && !Number.isNaN(cHSL.l)) {
        let newL = cHSL.l - 0.3;
        if (newL < 0) {
          newL = 0;
        }
        cHSL.l = newL;
        textColor = cHSL.toString();
      }

      return {
        bgColor: '#fff',
        textColor,
      };
    }
  }, [node]);
  const cssVarStyle = useMemo(() => {
    return {
      '--bg-color': bgColor,
      '--text-color': textColor,
    };
  }, [bgColor, textColor]) as React.CSSProperties;

  return {
    cssVarStyle,
    bgColor,
    textColor,
  };
}
