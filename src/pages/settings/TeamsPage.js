import React, { useState } from "react";
import "./TeamsPage.css";
import TreeNode from "../../components/TreeNode";
import GlobalEmployeeModal from "../../components/GlobalEmployeeModal";
import {
  organizationTreeData,
  findParentNode,
  getSubordinates as getOrgSubordinates,
  transformEmployeeForModal,
} from "../../utils/organizationData";

const TeamsPage = ({ service }) => {
  // 트리 구조 데이터 (조직 데이터 시스템 사용)
  const [treeData, setTreeData] = useState(organizationTreeData);

  // 드래그 앤 드롭 상태
  const [draggedNode, setDraggedNode] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // 모달 상태
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // 이동 확인 모달 상태
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveData, setMoveData] = useState(null);

  // 트리 노드 토글 핸들러
  const handleNodeToggle = (nodeId, isExpanded) => {
    console.log(
      `Node ${nodeId} is now ${isExpanded ? "expanded" : "collapsed"}`
    );
  };

  // 트리 노드 클릭 핸들러
  const handleNodeClick = (node) => {
    const transformedNode = transformEmployeeForModal(node);
    setSelectedNode(transformedNode);
    setShowNodeModal(true);
  };

  // 예하 트리 찾기 함수 (조직 데이터 시스템 사용)
  const getSubordinates = (nodeId) => {
    return getOrgSubordinates(nodeId, treeData);
  };

  // 노드의 부모 찾기 함수 (조직 데이터 시스템 사용)
  const getParentNode = (nodeId) => {
    return findParentNode(nodeId, treeData);
  };

  // 드래그 시작 핸들러
  const handleDragStart = (node) => {
    setDraggedNode(node);
    console.log("Drag started:", node);
  };

  // 드래그 오버 핸들러
  const handleDragOver = (e, node) => {
    setDropTarget(node);
  };

  // 드롭 핸들러
  const handleDrop = (draggedNodeId, targetNode) => {
    if (!draggedNode || draggedNode.id === targetNode.id) {
      setDraggedNode(null);
      setDropTarget(null);
      return;
    }

    // 멤버 노드는 팀 노드에만 드롭 가능
    if (draggedNode.type === "member" && targetNode.type !== "team") {
      setDraggedNode(null);
      setDropTarget(null);
      return;
    }

    // 동일한 위치로 이동하는 것 방지
    const currentParent = getParentNode(draggedNode.id);
    if (currentParent && currentParent.id === targetNode.id) {
      setDraggedNode(null);
      setDropTarget(null);
      return;
    }

    // 이동 확인 모달 표시
    setMoveData({
      draggedNode: draggedNode,
      currentParent: currentParent,
      targetNode: targetNode,
    });
    setShowMoveModal(true);
    setDraggedNode(null);
    setDropTarget(null);
  };

  // 실제 이동 수행 함수
  const confirmMove = () => {
    if (!moveData) return;

    const newTreeData = moveNode(
      treeData,
      moveData.draggedNode.id,
      moveData.targetNode.id
    );
    setTreeData(newTreeData);
    setShowMoveModal(false);
    setMoveData(null);
  };

  // 이동 취소 함수
  const cancelMove = () => {
    setShowMoveModal(false);
    setMoveData(null);
  };

  // 노드 이동 함수
  const moveNode = (tree, draggedId, targetId) => {
    // 1. 드래그된 노드를 찾아서 제거
    let draggedNodeData = null;
    const removeNode = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === parseInt(draggedId)) {
          draggedNodeData = nodes[i];
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && removeNode(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };

    // 2. 타겟 노드를 찾아서 드래그된 노드를 추가
    const addNodeToTarget = (nodes) => {
      for (let node of nodes) {
        if (node.id === targetId) {
          if (!node.children) {
            node.children = [];
          }
          node.children.push(draggedNodeData);
          return true;
        }
        if (node.children && addNodeToTarget(node.children)) {
          return true;
        }
      }
      return false;
    };

    // 깊은 복사를 위해 JSON 사용
    const newTree = JSON.parse(JSON.stringify(tree));

    if (removeNode(newTree) && draggedNodeData) {
      addNodeToTarget(newTree);
    }

    return newTree;
  };

  // 팀 생성 함수
  const createTeam = (memberId, teamName) => {
    const newTreeData = JSON.parse(JSON.stringify(treeData));

    const convertMemberToTeam = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === memberId && nodes[i].type === "member") {
          // 멤버를 팀으로 변환
          nodes[i] = {
            ...nodes[i],
            type: "team",
            name: teamName || `${nodes[i].name}팀`, // 입력받은 팀 이름 사용
            leaderName: nodes[i].name,
            leaderPosition: nodes[i].position || "팀장",
            children: [],
          };
          return true;
        }
        if (nodes[i].children && convertMemberToTeam(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };

    if (convertMemberToTeam(newTreeData)) {
      setTreeData(newTreeData);
      return true;
    }
    return false;
  };

  // 팀 제거 함수
  const removeTeam = (teamId) => {
    const newTreeData = JSON.parse(JSON.stringify(treeData));

    const convertTeamToMember = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === teamId && nodes[i].type === "team") {
          // 예하에 멤버가 있는지 확인
          if (nodes[i].children && nodes[i].children.length > 0) {
            alert("예하에 소속된 멤버가 있어 팀을 제거할 수 없습니다.");
            return false;
          }

          // 팀을 멤버로 변환
          nodes[i] = {
            id: nodes[i].id,
            type: "member",
            name: nodes[i].leaderName || nodes[i].name,
            position: "팀원",
            email:
              nodes[i].email ||
              `${(nodes[i].leaderName || nodes[i].name)
                .toLowerCase()
                .replace(/\s+/g, ".")}@company.com`,
          };
          return true;
        }
        if (nodes[i].children && convertTeamToMember(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };

    if (convertTeamToMember(newTreeData)) {
      setTreeData(newTreeData);
      return true;
    }
    return false;
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div>
          <h3>팀 관리 </h3>
          <p>
            조직도를 확인하세요. 조직 및 멤버를 드래그하여 자유롭게 이동할 수
            있습니다.
          </p>
        </div>
      </div>

      <div className="teams-tree-container">
        {treeData.map((rootNode) => (
          <TreeNode
            key={rootNode.id}
            node={rootNode}
            depth={0}
            onToggle={handleNodeToggle}
            onNodeClick={handleNodeClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedNode={draggedNode}
            dropTarget={dropTarget}
            getParentNode={getParentNode}
          />
        ))}
      </div>

      {/* 직원 정보 모달 */}
      <GlobalEmployeeModal
        isOpen={showNodeModal}
        onClose={() => setShowNodeModal(false)}
        employee={selectedNode}
        user={{ role: "admin", position: "팀장" }} // 임시 사용자 정보
        showTeamManagement={true}
        showSubordinates={true}
        subordinates={selectedNode ? getSubordinates(selectedNode.id) : []}
        onCreateTeam={(employeeId, teamName) => {
          if (createTeam(employeeId, teamName)) {
            setShowNodeModal(false);
          }
        }}
        onRemoveTeam={(employeeId) => {
          if (removeTeam(employeeId)) {
            setShowNodeModal(false);
          }
        }}
        TreeNodeComponent={TreeNode}
        treeNodeProps={{
          onToggle: handleNodeToggle,
          onNodeClick: handleNodeClick,
          onDragStart: handleDragStart,
          onDragOver: handleDragOver,
          onDrop: handleDrop,
          draggedNode: draggedNode,
          dropTarget: dropTarget,
          getParentNode: getParentNode,
        }}
      />

      {/* 이동 확인 모달 */}
      {showMoveModal && moveData && (
        <div className="modal-overlay" onClick={cancelMove}>
          <div
            className="move-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="move-modal-header">
              <h3>조직 이동 확인</h3>
              <button className="close-button" onClick={cancelMove}>
                ×
              </button>
            </div>
            <div className="move-modal-body">
              <div className="move-info">
                <div className="move-item">
                  <span className="move-label">이동할 항목:</span>
                  <span className="move-value">
                    {moveData.draggedNode.type === "team"
                      ? `${moveData.draggedNode.leaderName || "팀장"} (${
                          moveData.draggedNode.name
                        })`
                      : `${moveData.draggedNode.name}`}
                  </span>
                </div>
                <div className="move-item">
                  <span className="move-label">현재 위치:</span>
                  <span className="move-value current-location">
                    {moveData.currentParent
                      ? `${moveData.currentParent.leaderName || "팀장"} (${
                          moveData.currentParent.name
                        })`
                      : "최상위"}
                  </span>
                </div>
                <div className="move-arrow">↓</div>
                <div className="move-item">
                  <span className="move-label">이동할 위치:</span>
                  <span className="move-value new-location">
                    {moveData.targetNode.leaderName || "팀장"} (
                    {moveData.targetNode.name})
                  </span>
                </div>
              </div>
              <div className="move-actions">
                <button className="btn btn-secondary" onClick={cancelMove}>
                  취소
                </button>
                <button className="btn btn-primary" onClick={confirmMove}>
                  이동 확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
