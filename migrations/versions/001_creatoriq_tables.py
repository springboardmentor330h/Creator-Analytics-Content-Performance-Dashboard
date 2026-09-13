"""Create CreatorIQ analytics tables."""
from alembic import op
import sqlalchemy as sa

revision="001_creatoriq_tables"
down_revision=None
branch_labels=None
depends_on=None

def upgrade():
    op.create_table("content",
        sa.Column("id",sa.Integer(),primary_key=True),
        sa.Column("creator_id",sa.Integer(),nullable=False),
        sa.Column("platform",sa.String(50),nullable=False),
        sa.Column("content_title",sa.String(500),nullable=False),
        sa.Column("views",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("likes",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("comments",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("shares",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("saves",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("watch_time",sa.Float(),nullable=False,server_default="0"),
        sa.Column("reach",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("published_date",sa.Date()),
        sa.Column("external_content_id",sa.String(255)),
        sa.UniqueConstraint("platform","external_content_id",name="uq_content_platform_external_id"))
    op.create_table("audience",
        sa.Column("id",sa.Integer(),primary_key=True),sa.Column("creator_id",sa.Integer(),nullable=False),
        sa.Column("age_group",sa.String(50),nullable=False),sa.Column("gender",sa.String(50),nullable=False),
        sa.Column("country",sa.String(100),nullable=False),sa.Column("city",sa.String(100),nullable=False),
        sa.Column("device_type",sa.String(50),nullable=False),sa.Column("active_hour",sa.Integer(),nullable=False),
        sa.Column("followers",sa.Integer(),nullable=False,server_default="0"),sa.Column("impressions",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("reach",sa.Integer(),nullable=False,server_default="0"))
    op.create_table("growth",
        sa.Column("id",sa.Integer(),primary_key=True),sa.Column("creator_id",sa.Integer(),nullable=False),
        sa.Column("date",sa.Date(),nullable=False),sa.Column("followers",sa.Integer(),nullable=False,server_default="0"),
        sa.Column("reach",sa.Integer(),nullable=False,server_default="0"),sa.Column("engagement_rate",sa.Float(),nullable=False,server_default="0"))
    op.create_table("revenue",
        sa.Column("id",sa.Integer(),primary_key=True),sa.Column("creator_id",sa.Integer(),nullable=False),
        sa.Column("source",sa.String(80),nullable=False),sa.Column("amount",sa.Float(),nullable=False),
        sa.Column("currency",sa.String(10),nullable=False,server_default="INR"),sa.Column("received_date",sa.Date(),nullable=False),
        sa.Column("description",sa.String(500)))
    op.create_table("sponsorships",
        sa.Column("id",sa.Integer(),primary_key=True),sa.Column("creator_id",sa.Integer(),nullable=False),
        sa.Column("brand_name",sa.String(150),nullable=False),sa.Column("campaign",sa.String(200),nullable=False),
        sa.Column("contract_value",sa.Float(),nullable=False),sa.Column("start_date",sa.Date(),nullable=False),
        sa.Column("end_date",sa.Date()),sa.Column("status",sa.String(50),nullable=False),sa.Column("payment_status",sa.String(50),nullable=False))
    op.create_table("notifications",
        sa.Column("id",sa.Integer(),primary_key=True),sa.Column("creator_id",sa.Integer(),nullable=False),
        sa.Column("notification_type",sa.String(50),nullable=False),sa.Column("title",sa.String(200),nullable=False),
        sa.Column("message",sa.Text(),nullable=False),sa.Column("is_read",sa.Boolean(),nullable=False,server_default=sa.text("false")),
        sa.Column("created_at",sa.DateTime(),nullable=False))

def downgrade():
    for table in ["notifications","sponsorships","revenue","growth","audience","content"]:
        op.drop_table(table)
