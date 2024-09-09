export * from './interface';
import { RawNode } from '../node/interface';
import { Payload } from './interface';
let i = 1;
const uuid = () => (i++).toString();

export const exampleSourceData: RawNode<Payload> = {
  id: uuid(),
  payload: { content: 'Scott' },
  children: [
    { id: uuid(), payload: { content: 'Jian Lin' } },
    {
      id: uuid(),
      payload: { content: 'Yang Huangfu' },
      children: [
        { id: uuid(), payload: { content: 'Jianhui Zeng' } },
        { id: uuid(), payload: { content: 'Jiaming Mao' } },
        { id: uuid(), payload: { content: 'Zhengyi Xu' } },
        { id: uuid(), payload: { content: 'Che Yang' } },
        { id: uuid(), payload: { content: 'Kun Wang' } },
        { id: uuid(), payload: { content: 'Jianli Wei' } },
        { id: uuid(), payload: { content: 'Jiajun Yan' } },
        { id: uuid(), payload: { content: 'Yuanqing Zhu' } },
      ],
    },
    {
      id: uuid(),
      payload: { content: 'Jianjun Chen' },
      children: [
        { id: uuid(), payload: { content: 'Yu He' } },
        { id: uuid(), payload: { content: 'Zhuoyu Qian' } },
        { id: uuid(), payload: { content: 'Ying Wu' } },
        { id: uuid(), payload: { content: 'Pengyuan Wang' } },
        { id: uuid(), payload: { content: 'Yanjun Shen' } },
        { id: uuid(), payload: { content: 'Menci Naia' } },
        { id: uuid(), payload: { content: 'Lun Zhang' } },
      ],
    },
    {
      id: uuid(),
      payload: { content: 'Yuanjun Zhu' },
      children: [
        { id: uuid(), payload: { content: 'Chang Liu' } },
        { id: uuid(), payload: { content: 'Qikai Zhong' } },
        { id: uuid(), payload: { content: 'Yue Liu' } },
        { id: uuid(), payload: { content: 'Yi Huang' } },
        { id: uuid(), payload: { content: 'Ruinan Xu' } },
        { id: uuid(), payload: { content: 'Chunyang Huo' } },
        { id: uuid(), payload: { content: 'Jiayu Chen' } },
        { id: uuid(), payload: { content: 'Patrick Wang' } },
      ],
    },
    {
      id: uuid(),
      payload: { content: 'Qun Mi' },
      children: [
        { id: uuid(), payload: { content: 'Ming Yang' } },
        { id: uuid(), payload: { content: 'Juntong Liu' } },
        { id: uuid(), payload: { content: 'Zhenyu Shan' } },
        { id: uuid(), payload: { content: 'Qiang Wu' } },
        { id: uuid(), payload: { content: 'Yue Xiong' } },
        { id: uuid(), payload: { content: 'Man Yang' } },
        { id: uuid(), payload: { content: 'Zhentao Lu' } },
        { id: uuid(), payload: { content: 'Jing Li' } },
        { id: uuid(), payload: { content: 'Yu Tong' } },
        { id: uuid(), payload: { content: 'Zhengda Wang' } },
        { id: uuid(), payload: { content: 'Jingping Liu' } },
      ],
    },
    { id: uuid(), payload: { content: 'Jiashuang Shang' } },
  ],
};
