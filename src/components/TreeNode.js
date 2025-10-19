import React, { useState } from "react";
import "./TreeNode.css";

const TreeNode = ({
  node,
  depth = 0,
  onToggle,
  onNodeClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggedNode,
  dropTarget,
  getParentNode,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onToggle) {
      onToggle(node.id, !isExpanded);
    }
  };

  const handleNodeClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // 드래그 시작
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) {
      onDragStart(node);
    }
  };

  // 드래그 종료 (취소 포함)
  const handleDragEnd = (e) => {
    setIsDragOver(false);
    if (onDragStart) {
      onDragStart(null); // 드래그 상태 초기화
    }
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();

    // 드롭 불가능한 조건들
    let canDrop =
      draggedNode &&
      draggedNode.id !== node.id &&
      !isDescendant(draggedNode, node) &&
      node.type === "team"; // 팀 노드에만 드롭 가능

    // 동일한 위치로 이동하는 것 방지
    if (canDrop && getParentNode) {
      const currentParent = getParentNode(draggedNode.id);
      if (currentParent && currentParent.id === node.id) {
        canDrop = false;
      }
    }

    if (!canDrop) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
    if (onDragOver) {
      onDragOver(e, node);
    }
  };

  // 드래그 리브
  const handleDragLeave = (e) => {
    // 자식 요소로 이동하는 경우가 아닐 때만 isDragOver를 false로 설정
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  // 드롭
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const draggedNodeId = e.dataTransfer.getData("text/plain");

    // 드롭 불가능한 조건들
    let canDrop =
      draggedNode &&
      draggedNode.id !== node.id &&
      !isDescendant(draggedNode, node) &&
      node.type === "team"; // 팀 노드에만 드롭 가능

    // 동일한 위치로 이동하는 것 방지
    if (canDrop && getParentNode) {
      const currentParent = getParentNode(draggedNode.id);
      if (currentParent && currentParent.id === node.id) {
        canDrop = false;
      }
    }

    if (!canDrop) {
      return;
    }

    if (onDrop) {
      onDrop(draggedNodeId, node);
    }
  };

  // 노드가 다른 노드의 자손인지 확인
  const isDescendant = (ancestor, descendant) => {
    if (!ancestor.children) return false;

    for (const child of ancestor.children) {
      if (child.id === descendant.id) return true;
      if (isDescendant(child, descendant)) return true;
    }
    return false;
  };

  const hasChildren = node.children && node.children.length > 0;
  const isTeamNode = node.type === "team";
  const isMemberNode = node.type === "member";

  // 드래그 중인 노드인지 확인
  const isDragging = draggedNode && draggedNode.id === node.id;

  // 드롭 가능한 노드인지 확인 (팀 노드에만 드롭 가능, 멤버에게는 드롭 불가)
  const canDrop =
    draggedNode &&
    isTeamNode && // 팀 노드에만 드롭 가능
    !isDescendant(draggedNode, node) &&
    draggedNode.id !== node.id;

  return (
    <div className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
      <div
        className={`tree-node-content ${
          isTeamNode ? "team-node" : "member-node"
        } ${isDragging ? "dragging" : ""} ${
          isDragOver && canDrop ? "drag-over" : ""
        } ${!canDrop && isDragOver ? "drag-invalid" : ""}`}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 접기/펼치기 버튼 (팀 노드이고 자식이 있을 때만) */}
        {isTeamNode && hasChildren && (
          <button
            className={`tree-toggle ${isExpanded ? "expanded" : "collapsed"}`}
            onClick={handleToggle}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        )}

        {/* 노드 아이콘 */}
        <div className="tree-node-icon">
          {isTeamNode ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>

        {/* 노드 정보 */}
        <div className="tree-node-info" onClick={handleNodeClick}>
          {/* 팀 노드인 경우: 팀장 썸네일 - 팀장 이름 - 팀 이름(배지) */}
          {isTeamNode && node.leaderName ? (
            <div className="team-node-compact">
              <div className="leader-thumbnail">
                {node.leaderName.charAt(0)}
              </div>
              <div className="leader-name-compact">{node.leaderName}</div>
              <div className="team-name-badge">{node.name}</div>
            </div>
          ) : isTeamNode ? (
            <div className="team-node-compact">
              <div className="team-name-badge">{node.name}</div>
            </div>
          ) : (
            /* 멤버 노드인 경우 */
            <div className="member-node-compact">
              <div className="member-thumbnail">{node.name.charAt(0)}</div>
              <div className="member-name">{node.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* 자식 노드들 */}
      {isTeamNode && hasChildren && isExpanded && (
        <div className="tree-node-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              draggedNode={draggedNode}
              dropTarget={dropTarget}
              getParentNode={getParentNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
