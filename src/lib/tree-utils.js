// Build a tree from nodes { gbifEntry, node }
// ---------------------------------------
import _clone from 'lodash/clone'
import _mapValues from 'lodash/mapValues'
import _find from 'lodash/find'
import _sortBy from 'lodash/sortBy'

function toBranch( node ){
  return {
    lineage: [].concat(node.otNode.lineage).reverse()
    , nTips: 1
    , node: node
    // split:
  }
}

function equals( nodeOrBranch1, nodeOrBranch2 ){
  var id1 = nodeOrBranch1.node_id || nodeOrBranch1.otNode.node_id
  var id2 = nodeOrBranch2.node_id || nodeOrBranch2.otNode.node_id
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
    console.log(branch2.node, branch1.lineage)
    if ( branch2.node && equals(branch1.lineage[0], branch2.node) ){
      branch1.node = branch2.node
      branch1.lineage = lineage
      branch1.split = [subtree]
      return
    }
  }

  subtree.nTips--
  branch1.lineage = lineage
  branch1.split = [ subtree, branch2 ]
  delete branch1.node
}

function joinTree( tree, branch ){

  tree.nTips++

  for ( let i = 0, l = tree.lineage.length; i < l; i++ ){
    // check if branch can join the tree's branch
    let branchParent = branch.lineage[ i ]
    if ( !branchParent || tree.lineage[ i ].node_id !== branchParent.node_id ){
      // this means we found a branch
      mergeAt( tree, branch, i )
      return true
    }
  }

  if ( !tree.split ){
    // this means it splits right at the node
    branch = _mapValues( branch, _clone )
    branch.lineage.splice( 0, tree.lineage.length )
    tree.split = [{ lineage: [], nTips: 1, node: tree.node }, branch]
    delete tree.node
    return true
  }

  branch = _mapValues( branch, _clone )
  branch.lineage.splice( 0, tree.lineage.length )

  // if we got here, then we didn't find a place to join in the tree lineage...
  // so let's check the splits
  let stem = _find( tree.split, stem => stem.lineage[0].node_id === branch.lineage[0].node_id )
  if ( !stem ){
    // if none of the splits match then add to this split
    // #edgecases
    tree.split.push( branch )
    return true
  }

  return joinTree( stem, branch )
}

export function buildReducedTree( nodes ){
  // longest first
  nodes = _sortBy(nodes, n => n.otNode.lineage.length).reverse()
  var tree = toBranch( nodes[0] )

  for ( let i = 1, l = nodes.length; i < l; i++ ){
    let ret = joinTree( tree, toBranch( nodes[i] ) )
    if ( !ret ){
      // this should never happen. it means it couldn't put a branch in the tree
      throw new Error( 'Could not create cohesive tree from nodes' )
    }
  }

  return tree
}
