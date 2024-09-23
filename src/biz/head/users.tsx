import { css } from "@root/base/styled";
import { useRef, useState } from "react";

const SBox = css`
  display: flex;
`;

const SAvatar = css`
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 28px;
  outline: 2px solid white;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    border-color: #2370ff;
  }
  &>img {
    display: block;
    width: 100%;
    border-radius: 28px;
  }
  &+& {
    margin-left: -4px;
  }
`;

const SUserDetail = css`
  position: absolute;
  z-index: 100;
  top: calc(100% + 6px);
  left: 0;
  padding: 4px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e3e3e3;

  display: flex;
  align-items: center;
  gap: 50px;

  .left {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    font-size: 12px;
    .avatar {
      height: 28px;
      width: 28px;
      img {
        display: block;
        width: 100%;
        border-radius: 4px;
      }
    }
  }
  .right {
    height: 8px;
    width: 8px;
    border-radius: 4px;
    background-color: #1fec7f;
    margin-right: 10px;
  }
`;



interface UserInfo {
  id: string;
  name: string;
  avatar: string;
}

const MockUsers: UserInfo[] = [
  {
    id: 's1',
    name: 'Jiashuang Shang',
    avatar: 'https://img1.baidu.com/it/u=1353340546,4028340368&fm=253&fmt=auto&app=138&f=JPEG?w=200&h=200',
  },
  {
    id: 's2',
    name: 'Scott Wei',
    avatar: 'https://img2.baidu.com/it/u=2726011848,1335299621&fm=253&fmt=auto&app=138&f=JPEG?w=200&h=200',
  },
  {
    id: 's3',
    name: 'Jianli Wei',
    avatar: 'https://img2.baidu.com/it/u=2068851657,392186408&fm=253&fmt=auto&app=138&f=JPEG?w=200&h=200',
  },
  {
    id: 's4',
    name: 'Qiang Wu',
    avatar: 'https://img0.baidu.com/it/u=1243743546,257391698&fm=253&fmt=auto&app=138&f=JPEG?w=200&h=200',
  },
];

function User(props: {
  user: UserInfo;
}) {
  const { user: { id, name, avatar } } = props;
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={SAvatar}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <img src={avatar} />
      {visible && (
        <div className={SUserDetail}>
          <div className="left">
            <div className="avatar">
              <img src={avatar} />
            </div>
            <div>{name}</div>
          </div>
          <div className="right"></div>
        </div>
      )}
    </div>
  );
}


export function Users() {
  const users = useState(MockUsers)[0];

  return (
    <div className={SBox}>
      {users.slice(0, 4).map((u) => (
        <User key={u.id} user={u} />
      ))}
    </div>
  );
}

