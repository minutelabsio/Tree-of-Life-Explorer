// Build a tree from nodes { gbifEntry, node }
// ---------------------------------------
import _clone from 'lodash/clone'
import _mapValues from 'lodash/mapValues'
import _find from 'lodash/find'
import _sortBy from 'lodash/sortBy'

export function getDepth( tree, max = 0 ){
  if ( !tree.split ){
    return max + 1
  }

  if ( tree.node ){
    max += 1
  }

  return tree.split.reduce( (max, tree) => Math.max(max, getDepth(tree, max)), max )
}

function toBranch( node ){
  return {
    lineage: [].concat(node.lineage).reverse()
    , nTips: 1
    , node: node
    // split:
  }
}

function equals( nodeOrBranch1, nodeOrBranch2 ){
  var id1 = nodeOrBranch1.node_id || nodeOrBranch1.node_id
  var id2 = nodeOrBranch2.node_id || nodeOrBranch2.node_id
  return id1 === id2
}

function mergeAt( branch1, branch2, i ){
  let lineage = branch1.lineage.splice( 0, i )
  // shallow clone
  branch2 = _mapValues( branch2, _clone )
  branch2.lineage.splice( 0, i )

  let subtree = _clone(branch1)

  if ( !branch2.lineage.length ){
    // check if we're adding a node in the middle
    if ( branch2.node && equals(branch1.lineage[0], branch2.node) ){
      branch1.node = branch2.node
      branch1.lineage = lineage
      branch1.split = [subtree]
      return 0
    }
  }

  branch1.nTips++
  branch1.lineage = lineage
  branch1.split = [ subtree, branch2 ]
  delete branch1.node
  return 1
}

function joinTree( tree, branch ){

  for ( let i = 0, l = tree.lineage.length; i < l; i++ ){
    // check if branch can join the tree's branch
    let branchParent = branch.lineage[ i ]
    if ( !branchParent || tree.lineage[ i ].node_id !== branchParent.node_id ){
      // this means we found a branch
      return mergeAt( tree, branch, i )
    }
  }

  if ( !tree.split ){
    // this means it splits right at the node
    branch = _mapValues( branch, _clone )
    branch.lineage.splice( 0, tree.lineage.length )
    tree.nTips++
    tree.split = [{ lineage: [], nTips: 1, node: tree.node }, branch]
    delete tree.node
    return 1
  }

  branch = _mapValues( branch, _clone )
  branch.lineage.splice( 0, tree.lineage.length )

  // if we got here, then we didn't find a place to join in the tree lineage...
  // so let's check the splits
  let stem = _find( tree.split, stem => stem.lineage[0].node_id === branch.lineage[0].node_id )
  if ( !stem ){
    // if none of the splits match then add to this split
    // #edgecases
    tree.nTips++
    tree.split.push( branch )
    return 1
  }

  let tipsAdded = joinTree( stem, branch )
  tree.nTips += tipsAdded
  return tipsAdded
}

function getNodeId( branch ){
  return branch.node ? branch.node.node_id : branch.lineage[0].node_id
}

function treeSort( tree ){
  if (!tree.split) { return }
  tree.split.sort( (a, b) => getNodeId(a) > getNodeId(b) )
  tree.split.forEach( treeSort )
}

export function buildReducedTree( nodes ){
  // longest first
  nodes = _sortBy(nodes, n => n.lineage.length).reverse()
  var tree = toBranch( nodes[0] )

  for ( let i = 1, l = nodes.length; i < l; i++ ){
    joinTree( tree, toBranch( nodes[i] ) )
  }

  // assign a depth value to each branch
  let depth = getDepth( tree )
  tree.depth = depth

  // Sorting improves the consistency
  treeSort( tree )

  return tree
}
