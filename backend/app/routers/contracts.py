from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.contract import ManagementContract

router = APIRouter(prefix="/contracts", tags=["contracts"])

@router.get("/managers")
def list_managers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    managers = db.query(User).filter(User.role.in_(["agency", "marketing_team"])).all()
    return [{"id": str(m.id), "full_name": m.full_name, "role": m.role} for m in managers]

@router.get("/mine")
def my_contracts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role == "creator":
        rows = db.query(ManagementContract).filter(
            ManagementContract.creator_id == current_user.creator_id,
            ManagementContract.status == "active",
        ).all()
        result = []
        for r in rows:
            manager = db.query(User).filter(User.id == r.manager_user_id).first()
            result.append({
                "contract_id": r.id,
                "manager_id": str(r.manager_user_id),
                "manager_name": manager.full_name if manager else "Unknown",
                "manager_role": manager.role if manager else "unknown",
            })
        return result
    elif current_user.role in ("agency", "marketing_team"):
        rows = db.query(ManagementContract).filter(
            ManagementContract.manager_user_id == current_user.id,
            ManagementContract.status == "active",
        ).all()
        return [{"contract_id": r.id, "creator_id": r.creator_id} for r in rows]
    return []

@router.post("", status_code=201)
def create_contract(payload: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can add a manager")
    if current_user.creator_id is None:
        raise HTTPException(status_code=400, detail="Your account has no creator_id assigned")

    manager_user_id = payload.get("manager_user_id")
    manager = db.query(User).filter(User.id == manager_user_id, User.role.in_(["agency", "marketing_team"])).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    existing = db.query(ManagementContract).filter(
        ManagementContract.manager_user_id == manager_user_id,
        ManagementContract.creator_id == current_user.creator_id,
        ManagementContract.status == "active",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already linked to this manager")

    contract = ManagementContract(manager_user_id=manager_user_id, creator_id=current_user.creator_id, status="active")
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return {"message": "Manager added successfully", "contract_id": contract.id}

@router.delete("/{contract_id}")
def remove_contract(contract_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    contract = db.query(ManagementContract).filter(ManagementContract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.role == "creator" and contract.creator_id != current_user.creator_id:
        raise HTTPException(status_code=403, detail="Not your contract")
    db.delete(contract)
    db.commit()
    return {"message": "Manager removed"}