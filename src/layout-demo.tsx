import compactBoxLayout, {
  HierarchyOptions,
  Node,
  Direction,
} from '@base/layout';
import { css } from '@base/styled';
import {
  Fragment,
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface DataTree {
  id: string;
  props: {
    text: string;
  };
  children?: DataTree[];
  collapsed?: boolean;
  height?: number;
  width?: number;
}

const options: HierarchyOptions<DataTree> = {
  direction: 'H',
  getInfo: (d) => ({
    id: d.id,
    padding: { h: 12, v: 12 },
    size: { height: d.height || 20, width: d.width || 60 },
    collapsed: d.collapsed,
  }),
  getChildren: (d) => d.children,
};

const uuid = () => Math.round((Math.random() + 1) * Date.now()).toString(36);

function generate() {
  const source: DataTree = {
    id: uuid(),
    props: { text: 'Scott Wei' },
    children: [
      { id: uuid(), props: { text: 'Jian Lin' } },
      {
        id: uuid(),
        props: { text: 'Yang Huangfu' },
        children: [
          { id: uuid(), props: { text: 'Jianhui Zeng' } },
          { id: uuid(), props: { text: 'Jiaming Mao' } },
          { id: uuid(), props: { text: 'Zhengyi Xu' } },
          { id: uuid(), props: { text: 'Che Yang' } },
          { id: uuid(), props: { text: 'Kun Wang' } },
          { id: uuid(), props: { text: 'Jianli Wei' } },
          { id: uuid(), props: { text: 'Jiajun Yan' } },
          { id: uuid(), props: { text: 'Yuanqing Zhu' } },
        ],
      },
      {
        id: uuid(),
        props: { text: 'Jianjun Chen' },
        children: [
          { id: uuid(), props: { text: 'Yu He' } },
          { id: uuid(), props: { text: 'Zhuoyu Qian' } },
          { id: uuid(), props: { text: 'Ying Wu' } },
          { id: uuid(), props: { text: 'Pengyuan Wang' } },
          { id: uuid(), props: { text: 'Yanjun Shen' } },
          { id: uuid(), props: { text: 'Menci Naia' } },
          { id: uuid(), props: { text: 'Lun Zhang' } },
        ],
      },
      {
        id: uuid(),
        props: { text: 'Yuanjun Zhu' },
        children: [
          { id: uuid(), props: { text: 'Chang Liu' } },
          { id: uuid(), props: { text: 'Qikai Zhong' } },
          { id: uuid(), props: { text: 'Yue Liu' } },
          { id: uuid(), props: { text: 'Yi Huang' } },
          { id: uuid(), props: { text: 'Ruinan Xu' } },
          { id: uuid(), props: { text: 'Chunyang Huo' } },
          { id: uuid(), props: { text: 'Jiayu Chen' } },
          { id: uuid(), props: { text: 'Patrick Wang' } },
        ],
      },
      {
        id: uuid(),
        props: { text: 'Qun Mi' },
        children: [
          { id: uuid(), props: { text: 'Ming Yang' } },
          { id: uuid(), props: { text: 'Juntong Liu' } },
          { id: uuid(), props: { text: 'Zhenyu Shan' } },
          { id: uuid(), props: { text: 'Qiang Wu' } },
          { id: uuid(), props: { text: 'Yue Xiong' } },
          { id: uuid(), props: { text: 'Man Yang' } },
          { id: uuid(), props: { text: 'Zhentao Lu' } },
          { id: uuid(), props: { text: 'Jing Li' } },
          { id: uuid(), props: { text: 'Yu Tong' } },
          { id: uuid(), props: { text: 'Zhengda Wang' } },
          { id: uuid(), props: { text: 'Jingping Liu' } },
        ],
      },
      { id: uuid(), props: { text: 'Jiashuang Shang' } },
    ],
  };
  return source;
}

type SizeMap = Record<string, { w: number; h: number }>;
function Measure(props: {
  children: React.ReactNode;
  finish: (sizes: SizeMap) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current!;
    const sizes: SizeMap = {};
    for (const el of Array.from(svg.children)) {
      const text = el as SVGTextElement;
      const { width: w, height: h } = text.getBoundingClientRect();
      sizes[text.id] = { w, h };
    }
    props.finish(sizes);
  }, [props.finish]);

  return (
    <svg ref={ref} role="contentinfo" aria-label="Mind map">
      {props.children}
    </svg>
  );
}

const SDirections = css`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  line-height: 20px;
  gap: 4px;

  & > .dir-item {
    background-color: aliceblue;
    padding: 1px 10px;
    cursor: pointer;
    border: 1px solid #1893ff;
    &:hover {
      background-color: #badfff;
    }
    &.active {
      background-color: #1893ff;
      color: white;
    }
  }
`;

function MindMap(props: { source: DataTree; sizes: SizeMap }) {
  const { source, sizes } = props;
  const [dir, serDir] = useState<Direction>('H');
  const tree = useMemo(() => {
    function update(tree: DataTree) {
      const size = sizes[tree.id];
      if (size) {
        tree.width = size.w;
        tree.height = size.h;
      }
      tree.children?.forEach(update);
    }
    update(source);
    options.direction = dir;
    const root = compactBoxLayout(source, options);
    const { x: cx, y: cy } = root.center();
    root.translate(window.innerWidth / 2 - cx, window.innerHeight / 2 - cy);
    return root;
  }, [source, sizes, dir]);

  const nodes: React.ReactNode[] = [];
  function add(node: Node<DataTree>) {
    const {
      id,
      props: { text },
    } = node.data;
    const { x, y, width: w, height: h } = node;
    const item = (
      <Fragment key={id}>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke="#e3e3e3"
          strokeWidth={1}
        />
        {createElement('rect', {
          ...node.contentBox(4, 2),
          fill: '#038af8',
          rx: 2,
        })}
        <text
          x={w / 2 + x}
          y={h / 2 + y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={12}
        >
          {text}
        </text>
      </Fragment>
    );
    nodes.push(item);
  }
  tree.BFTraverse(add);

  return (
    <>
      <svg role="presentation" style={{ height: '100%', width: '100%' }}>
        {nodes}
      </svg>
      <div className={SDirections}>
        {(['LR', 'RL', 'TB', 'BT', 'H', 'V'] as const).map((d) => {
          return createElement(
            'div',
            {
              key: d,
              className: `dir-item ${d === dir ? ' active' : ''}`,
              onClick: () => serDir(d),
            },
            d,
          );
        })}
      </div>
    </>
  );
}

export function LayoutDemo() {
  const source = useMemo(generate, []);
  const [measured, setMeasured] = useState<SizeMap | null>(null);

  if (measured) {
    return <MindMap source={source} sizes={measured} />;
  }

  const texts: React.ReactNode[] = [];
  function add({ id, props, children }: DataTree) {
    texts.push(
      <text key={id} fontSize={12} id={id}>
        {props.text}
      </text>,
    );
    children?.forEach(add);
  }
  add(source);
  return <Measure finish={setMeasured}>{texts}</Measure>;
}
