/**
 * 用来存放 fiberNode 数据结构
 */
import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes'
import { FunctionComponent, HostComponent, WorkTag } from './workTags'
import { Flags, NoFlags } from './fiberFlags'
import { Container } from 'hostConfig'

export class FiberNode {
  type: any
  tag: WorkTag
  pendingProps: Props
  key: Key
  stateNode: any
  ref: Ref

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  memoizedProps: Props | null
  memoizedState: any
  alternate: FiberNode | null
  flags: Flags
  subtreeFlags: Flags
  updateQueue: unknown

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    // 实例属性
    this.tag = tag
    this.key = key
    this.stateNode = null // 节点对应的实际 DOM 节点或组件实例
    this.type = null // 节点的类型，可以是原生 DOM 元素、函数组件或类组件等

    //构成树状结构
    this.return = null // 父fiberNode
    this.sibling = null // 兄弟fiberNode
    this.child = null // 子fiberNode
    this.index = 0 // 同级fiber的索引

    this.ref = null

    // 作为工作单元
    this.pendingProps = pendingProps // 初始的props
    this.memoizedProps = null // 工作完成后的props
    this.memoizedState = null
    this.updateQueue = null

    this.alternate = null // 指向节点的备份节点，用于在协调过程中进行比较
    this.flags = NoFlags // 副作用
    this.subtreeFlags = NoFlags // 子树的副作用
  }
}

export class FiberRootNode {
  container: Container // 保存挂载节点 FiberRootNode
  current: FiberNode // 指向 hostRootFiber
  finishedWork: FiberNode | null // 最后递归完成的 fiber

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container
    this.current = hostRootFiber
    hostRootFiber.stateNode = this
    this.finishedWork = null
  }
}

/** 创建 WorkInProgress*/
export const createWorkInProgress = (
  current: FiberNode,
  pendingProps: Props
): FiberNode => {
  let wip = current.alternate

  if (wip === null) {
    // mount
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.stateNode = current.stateNode

    wip.alternate = current
    current.alternate = wip
  } else {
    // update
    wip.pendingProps = pendingProps
    wip.flags = NoFlags // 清除副作用
    wip.subtreeFlags = NoFlags
  }
  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizedProps = current.memoizedProps
  wip.memoizedState = current.memoizedState

  return wip
}

/** 根据element创建fiber并返回 */
export function createFiberFromElement(element: ReactElementType) {
  const { type, key, props } = element

  let fiberTag: WorkTag = FunctionComponent

  if (typeof type === 'string') {
    // <div/>  type: 'div'
    fiberTag = HostComponent
  } else if (typeof type !== 'function' && __DEV__) {
    console.warn('未定义的type类型', element)
  }
  // 创建 fiber 节点
  const fiber = new FiberNode(fiberTag, props, key)
  fiber.type = type

  return fiber
}
