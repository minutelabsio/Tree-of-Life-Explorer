// Build a tree from nodes { gbifEntry, node }
// ---------------------------------------
import _clone from 'lodash/clone'
import _mapValues from 'lodash/mapValues'
import _find from 'lodash/find'

function toBranch( node ){
  return {
    lineage: [].concat(node.otNode.lineage).reverse()
    , nTips: 1
    , node: node
    // split:
  }
}

function joinTree( tree, branch ){

  tree.nTips++

  for ( let i = 0, l = tree.lineage.length; i < l; i++ ){
    // check if branch can join the tree's branch
    if ( tree.lineage[ i ].node_id !== branch.lineage[ i ].node_id ){
      // this means we found a branch
      let lineage = tree.lineage.splice( 0, i )
      // shallow clone
      branch = _mapValues( branch, _clone )
      branch.lineage.splice( 0, i )

      let subtree = _clone(tree)
      subtree.nTips--
      tree.lineage = lineage
      tree.split = [ subtree, branch ]
      delete tree.node

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
